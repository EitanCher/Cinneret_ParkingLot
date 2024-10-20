// app.js
const express = require('express');
const bodyParser = require('body-parser');
const userRouters = require('./routers/userRouters');
const adminRouters = require('./routers/adminRouters');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('./utils/passport-config');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3001;
const path = require('path');
require('../backend/utils/cronJobs');
// Middleware setup
app.use('/api/users/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(cookieParser());

// Routes
app.use('/api/users', userRouters);
app.use('/api/admin', adminRouters);
app.get('/', (req, res) => {
  res.send('Hello from Express Server');
});

module.exports = app;
