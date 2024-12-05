const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const dotenv = require("dotenv");
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const User = require('../models/User');
dotenv.config();

const passportConfig = () => {
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user._id); // Ensure you are serializing the _id (not the full object)
});

passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user ID:', id);
  try {
    const user = await User.findById(id); // This should correctly find the user by _id
    if (!user) {
      return done(new Error('User not found'), null); // Handle if user is not found
    }
    console.log('User found:', user);
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error);
  }
});


  passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user ID:', id);
    try {
      const user = await User.findById(id);
      console.log('User found:', user);
      done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error);
    }
  });

  function generateRandomPassword(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }
    return password;
  }
  passport.use(
    new GoogleStrategy(
      {
        callbackURL: "/auth/google/callback",
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('passport configuration is working');
          
          const email = profile._json.email;
          const fullname = profile.displayName;
  
          let user = await User.findOne({ email });
          let password = generateRandomPassword(12);
  
          if (user) {
            console.log('User already exists!');
            console.log("usrid",user._id);
            
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            user.token = token; 
            console.log("ert",token);
            
            return done(null, { ...user.toObject(), token }); // Include token in the response
          } else {
            const hashedPassword = await bcrypt.hash(password, 10);
  
            // Create a new user
            console.log('Creating new user');
            const newUser = new User({
              fullname,
              phone: Math.floor(Math.random() * 10000000000).toString(),
              password: hashedPassword,
              email,
              dateOfJoin: new Date(),
            });
  
            await newUser.save();
            console.log('New user saved:', newUser);
  
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            
            return done(null, { ...newUser.toObject(), token }); 
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          done(error);
        }
      }
    )
  );
  
};

module.exports = passportConfig;
