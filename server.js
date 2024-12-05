const express = require('express');
const cors = require('cors');
const http = require('http');
const morgan=require('morgan')
require('dotenv').config();
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes.js');
const workerRoutes = require('./routes/workerRoutes.js');

const setupSocket=require('./Socket/socket.js')
// const chat=require('../backend/middleware/chat.js')
const passport = require('passport');
const passportConfig = require('../backend/auth/passport.js');
const session = require('express-session');
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(morgan('dev'));

app.use(session({
  secret: process.env.SESSION_SECRET, // Use the secret from .env file
  resave: false,
  saveUninitialized: false,
  cookie: { secure:false }
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

// // Create HTTP server
const server = http.createServer(app);

// // Setup Socket.IO
setupSocket(server); 
const io = new Server(server, { 
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});
app.set('socketio', io);
io.on('connection', (socket) => {
  // console.log("Client connected");
  socket.on('newWorker', (workerData) => {
    io.emit('newWorker', workerData); 
  });

  socket.on('disconnect', () => {
    // console.log('Client disconnected');
  });
});

// Routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/worker', workerRoutes);


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
