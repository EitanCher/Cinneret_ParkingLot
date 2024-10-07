// middlewares/rateLimit.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: 429,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window for general requests
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests from this IP. Please try again later.'
  }
});

module.exports = {
  loginLimiter,
  generalLimiter
};
