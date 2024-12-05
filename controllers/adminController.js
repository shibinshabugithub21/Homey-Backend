const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Admin Login
const  login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username === 'admin@gmail.com' && password === 'admin1234') {
      const token = jwt.sign(
          { 
              username: 'admin@gmail.com',
              role: 'admin' 
          }, 
          JWT_SECRET, 
          { expiresIn: '1h' }
      );
      
      res.cookie('access_token', token, { 
          httpOnly: true,
          secure:true === 'production',
          sameSite: 'strict',
          maxAge: 3600000 //
      });
      
      return res.status(200).json({ 
          message: 'Admin login successful', 
          token 
      });
  }

  return res.status(400).json({ message: 'Invalid username or password' });
};

// admin Logout
const logout=(req,res)=>{
  try {
    res.clearCookie('access_token');
    res.status(200).json({message:"Logout Successfully"});
  } catch (error) {
    console.error('logout error',error);
    res.status(500).json({message:'internal Server error'});
  }
}

module.exports = {
  login,logout
};
