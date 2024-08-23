require('dotenv').config('./.env');
require('./utils/cronJobs');
const express = require('express');
const bodyParser = require('body-parser');
const userRouters = require('./routers/userRouters');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;
const passport = require('./utils/passport-config');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors()); // Enable CORS if needed
app.use(passport.initialize());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Routes
app.use('/api/users', userRouters);
app.use('/api/users/webhook', bodyParser.raw({ type: 'application/json' }));

app.get('/', (req, res) => {
  res.send('Hello from Express Server');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

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
