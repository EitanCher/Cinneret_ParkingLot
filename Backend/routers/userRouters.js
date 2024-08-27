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
const {
  getParkingLotCities,
  // reserveParkingController,
  bookSlotController,
  findAvailableSlotController,
  cancelReservationController,
  getParkingHistory,
  calculateTotalParkingTimeByUser,
  calculateAverageParkingTimeByUser
} = require('../controllers/parkingController');
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

router.get('/parkinglots', getParkingLotCities);
//im aware the the router below doesn'tfully follow restful conventions by not usind :id. however i chose this approach in order to edit bulk items
router.patch('/cars', passport.authenticate('jwt', { session: false }), updateCars);
router.get('/subscriptions', getSubscriptionTiers);
router.post('/register', addUserController);
router.post('/login', login);
router.patch('/:id', passport.authenticate('jwt', { session: false }), updateUser);
router.post('/cars', passport.authenticate('jwt', { session: false }), addCarsController);
router.get('/parking/total-time', passport.authenticate('jwt', { session: false }), calculateTotalParkingTimeByUser);
router.get(
  '/parking/average-duration',
  passport.authenticate('jwt', { session: false }),
  calculateAverageParkingTimeByUser
);
router.post('/parking/reservation', passport.authenticate('jwt', { session: false }), bookSlotController);
//here also i decided to not use /:id in order to be able to keep the same controller and model to work with both admin and user
//important- idReservation in the req.body
//if anyone is signed in- we will know who it is and make sure that he can't delete a reservation that isnt his
//on the other hand no one can access the admin route without the api key
router.delete('/parking/reservation', passport.authenticate('jwt', { session: false }), cancelReservationController);
//use params
router.get('/parking/find-best-slot', passport.authenticate('jwt', { session: false }), findAvailableSlotController);
router.get('/parking/history', passport.authenticate('jwt', { session: false }), getParkingHistory);
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteUser);

router.get('/google/callback', googleCallback);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);
// Route to handle Stripe webhook events
router.post('/webhook', handleCheckoutSessionCompleted);
// Route to create a Stripe checkout session
router.post('/create-checkout-session', passport.authenticate('jwt', { session: false }), createStripeSession);

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
