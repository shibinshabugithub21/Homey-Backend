import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (allowedRoles = []) => async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token; 
  if (!accessToken) return next(errorHandler(401, 'You are not authenticated'));

  try {
    // Verify the access token
    const user = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = user;

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return next(errorHandler(403, 'Access denied'));
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      if (!refreshToken) {
        return next(errorHandler(403, 'Refresh token not found, login again'));
      }

      try {
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const newAccessToken = jwt.sign(
          { id: decodedRefreshToken.id, role: decodedRefreshToken.role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        req.user = decodedRefreshToken; 
        next();
      } catch (refreshErr) {
        return next(errorHandler(403, 'Refresh token is invalid, login again'));
      }
    } else {
      return next(errorHandler(403, 'Token is not valid'));
    }
  }
};

























// import jwt from 'jsonwebtoken';
// import { errorHandler } from './error.js';

// export const verifyToken = (allowedRoles = []) => (req, res, next) => {
//   const token = req.cookies.access_token; 
//   if (!token) return next(errorHandler(401, 'You are not authenticated'));

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return next(errorHandler(403, 'Token is not valid'));

//     req.user = user;
//     if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
//       return next(errorHandler(403, 'Access denied'));
//     }

//     next();
//   });
// };
// 