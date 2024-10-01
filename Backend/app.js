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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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

// Defer Until Core Functionality is Stable:
// Cross-Site Request Forgery (CSRF):

// CSRF Protection: Implement CSRF protection once you have authentication in place. It becomes crucial when you have forms or actions that change user data.
// Cross-Site Scripting (XSS):

// CSP Implementation: CSP can be complex and might interfere with development. Implement it once your application is functional to protect against XSS and data injection attacks.
// Secure Cookies:

// Cookie Flags (e.g., HttpOnly, Secure): Set secure cookie attributes after you have your authentication and session management working.
// Rate Limiting and IP Blocking:

// Rate Limiting: Implement rate limiting to prevent abuse. It's useful but might be added after core functionality.
// HTTPS:

// HTTPS: Ensure your application uses HTTPS before deploying it to production. It protects data in transit but can be set up towards the end of your development process.

// Defer Until Core Functionality is Stable:
// Cross-Site Request Forgery (CSRF):

// CSRF Protection: Implement CSRF protection once you have authentication in place. It becomes crucial when you have forms or actions that change user data.
// Cross-Site Scripting (XSS):

// CSP Implementation: CSP can be complex and might interfere with development. Implement it once your application is functional to protect against XSS and data injection attacks.
// Secure Cookies:

// Cookie Flags (e.g., HttpOnly, Secure): Set secure cookie attributes after you have your authentication and session management working.
// Rate Limiting and IP Blocking:

// Rate Limiting: Implement rate limiting to prevent abuse. It's useful but might be added after core functionality.
// HTTPS:

// HTTPS: Ensure your application uses HTTPS before deploying it to production. It protects data in transit but can be set up towards the end of your development process.
