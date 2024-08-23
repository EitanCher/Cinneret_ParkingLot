// example user login
// "Email": "john.doe@example.com",
// "Password": "password123"

const express = require('express');
const router = express.Router();
const {
  updateUser,
  deleteUser,
  getSubscriptionTiers,
  addUserController,
  login,
  addCarsController,
  updateCars
} = require('../controllers/userController');
const { googleCallback } = require('../controllers/authController');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const passport = require('passport');
const { createStripeSession } = require('../controllers/stripeCheckoutController');
const { handleCheckoutSessionCompleted } = require('../controllers/stripeWebHookController');

router.patch('/cars', passport.authenticate('jwt', { session: false }), updateCars);

// router.patch('/cars', (req, res) => {
//   console.log('PATCH /testupdate route hit');
//   console.log('Request Headers:', req.headers);
//   console.log('Request Body:', req.body);
//   res.json({ message: 'PATCH /testupdate route working' });
// });
router.get('/subscriptions', getSubscriptionTiers);
router.post('/register', addUserController);
router.post('/login', login);
router.patch('/:id', passport.authenticate('jwt', { session: false }), updateUser);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteUser);
router.post('/cars', passport.authenticate('jwt', { session: false }), addCarsController);
router.get('/google/callback', googleCallback);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Route to create a Stripe checkout session
router.post('/create-checkout-session', passport.authenticate('jwt', { session: false }), createStripeSession);
// Route to handle Stripe webhook events
router.post('/webhook', handleCheckoutSessionCompleted);
router.get('/webhook', (req, res) => {
  res.send('hello from ngrok');
});
module.exports = router;

//--------------------------------------------------------------------------------------------------------------------------------//
// Defer Until Core Functionality is Stable:
// Cross-Site Request Forgery (CSRF):

// CSRF Protection: Implement CSRF protection once you have authentication in place. It becomes crucial when you have forms or actions that change user data.
// Cross-Site Scripting (XSS):

// XSS Protection: While important, XSS protection can be complex. Start with sanitization and validation. Implement more advanced XSS defenses, like Content Security Policy (CSP), once your core functionality is stable.
// Content Security Policy (CSP):

// CSP Implementation: CSP can be complex and might interfere with development. Implement it once your application is functional to protect against XSS and data injection attacks.
// Secure Cookies:

// Cookie Flags (e.g., HttpOnly, Secure): Set secure cookie attributes after you have your authentication and session management working.
// Rate Limiting and IP Blocking:

// Rate Limiting: Implement rate limiting to prevent abuse. It's useful but might be added after core functionality.
// HTTPS:

// HTTPS: Ensure your application uses HTTPS before deploying it to production. It protects data in transit but can be set up towards the end of your development process.
