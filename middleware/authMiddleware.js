const jwt = require('jsonwebtoken');

const protectAdminRoute = (req, res, next) => {
  try {
      const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];

      if (!token) {
          return res.status(401).render('error', {
              title: 'Access Denied',
              message: 'Please login as admin to continue'
          });
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'admin') {
          return res.status(403).render('error', {
              title: 'Forbidden',
              message: 'You do not have permission to access this page'
          });
      }

      req.admin = decoded;
      next();
  } catch (error) {
      if (error.name === 'TokenExpiredError') {
          res.clearCookie('access_token');
          return res.status(401).render('error', {
              title: 'Session Expired',
              message: 'Your session has expired. Please login again.'
          });
      }

      return res.status(401).render('error', {
          title: 'Authentication Failed',
          message: 'Invalid authentication. Please login again.'
      });
  }
};

module.exports = protectAdminRoute ;