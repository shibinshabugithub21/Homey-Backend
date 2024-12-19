// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const morgan=require('morgan')
// require('dotenv').config();
// const adminRoutes = require('./routes/adminRoutes');
// const userRoutes = require('./routes/userRoutes.js');
// const workerRoutes = require('./routes/workerRoutes.js');

// const setupSocket=require('./Socket/socket.js')
// // const chat=require('../backend/middleware/chat.js')
// const passport = require('passport');
// const passportConfig = require('../backend/auth/passport.js');
// const session = require('express-session');
// const { Server } = require("socket.io");

// const PORT = process.env.PORT || 5000;
// const app = express();
// app.use(morgan('dev'));

// app.use(session({
//   secret: process.env.SESSION_SECRET, 
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure:false }
// }));

// passportConfig();
// app.use(express.json());
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
// }));

// // MongoDB Connection
// const connectDB = require('./config/db.js'); 
// connectDB();

// // // Create HTTP server
// const server = http.createServer(app);

// // // Setup Socket.IO
// setupSocket(server); 
// const io = new Server(server, { 
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST"]
//   }
// });
// app.set('socketio', io);
// io.on('connection', (socket) => {
//   // console.log("Client connected");
//   socket.on('newWorker', (workerData) => {
//     io.emit('newWorker', workerData); 
//   });

//   socket.on('disconnect', () => {
//     // console.log('Client disconnected');
//   });
// });

// // Routes
// app.use('/', userRoutes);
// app.use('/admin', adminRoutes);
// app.use('/worker', workerRoutes);

// // middelware for erroe handle
// app.get("*",(req,res)=>{
//   res.render("error")
// })


// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

const express = require('express');
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
require('dotenv').config();
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes.js');
const workerRoutes = require('./routes/workerRoutes.js');

const setupSocket = require('./Socket/socket.js');
const passport = require('passport');
const passportConfig = require('../backend/auth/passport.js');
const session = require('express-session');
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(morgan('dev'));

// Session and passport configuration
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

passportConfig();
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));

// MongoDB Connection
const connectDB = require('./config/db.js'); 
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
setupSocket(server);
const io = new Server(server, { 
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});
app.set('socketio', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  // console.log("Client connected");

  socket.on('newWorker', (workerData) => {
    io.emit('newWorker', workerData); 
  });

  socket.on('disconnect', () => {
    // console.log('Client disconnected');
  });

  socket.on('error', (error) => {
    console.error("Socket error:", error);
    socket.emit('error', { message: "An error occurred on the socket" });
  });
});

// Routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/worker', workerRoutes);

// Global error handling middleware for express
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Centralized error handling middleware 
app.use((err, req, res, next) => {
  console.error(err.stack); 

  const statusCode = err.status || 500;
  
  if (req.xhr || req.accepts('json') || req.accepts('html')) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  res.status(statusCode).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Oops! Something went wrong...</title>
        <style>
          body {
            text-align: center;
            font-family: Arial, sans-serif;
            padding: 50px;
          }
          h1 {
            color: red;
          }
          .smiley {
            font-size: 100px;
          }
        </style>
      </head>
      <body>
        <h1>Oops! Something went wrong!</h1>
        <p class="smiley">😊</p>
        <p>We are working on it. Please try again later.</p>
      </body>
    </html>
  `);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const morgan = require('morgan');
// require('dotenv').config();
// const adminRoutes = require('./routes/adminRoutes');
// const userRoutes = require('./routes/userRoutes.js');
// const workerRoutes = require('./routes/workerRoutes.js');

// const setupSocket = require('../backend/Socket/socket.js'); 
// const passport = require('passport');
// const passportConfig = require('../backend/auth/passport.js');
// const session = require('express-session');

// const PORT = process.env.PORT || 5000;
// const app = express();
// app.use(morgan('dev'));

// // Session setup
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false }
// }));

// // Passport setup
// passportConfig();
// app.use(express.json());
// app.use(passport.initialize());
// app.use(passport.session());

// // CORS setup
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
// }));

// // MongoDB connection
// const connectDB = require('./config/db.js'); 
// connectDB();

// // Create HTTP server
// const server = http.createServer(app);

// // Setup Socket.IO
// setupSocket(server); 



// // Routes
// app.use('/', userRoutes);
// app.use('/admin', adminRoutes);
// app.use('/worker', workerRoutes);

// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
