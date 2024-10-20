// example user login
// "Email": "john.doe@example.com",
// "Password": "password123"

const express = require('express');
const { loginLimiter, generalLimiter } = require('../middlewares/rateLimit');

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();
const {
  updateUser,
  deleteUser,
  getSubscriptionTiers,
  addUserController,
  login,
  addCarsController,
  updateCar,
  deleteCarById,
  getUserDetails,
  logout,
  fetchCheckoutSessionURL,
  getUserSubscription,
  getUserCars,
  getUpcomingReservations,
  markNotificationsAsRead,
  fetchUnreadNotificationsCount,
  fetchUserNotifications,
  markSingleNotificationRead
} = require('../controllers/userController');
const {
  getParkingLotCities,
  // reserveParkingController,
  bookSlotController,
  findAvailableSlotController,
  cancelReservationController,
  getParkingHistory,
  calculateTotalParkingTimeByUser,
  calculateAverageParkingTimeByUser,
  countSlotsByCityID
} = require('../controllers/parkingController');
const { googleCallback } = require('../controllers/authController');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI);
const passport = require('passport');
const { createStripeSession, cancelSubscription } = require('../controllers/stripeCheckoutController');
const { handleCheckoutSessionCompleted } = require('../controllers/stripeWebHookController');
const { authenticateJWT } = require('../middlewares/authenticateJWT');

router.use(generalLimiter);

router.get('/checkout-session/:sessionId', fetchCheckoutSessionURL);

router.get(
  '/details',
  (req, res, next) => {
    console.log(`Incoming request to ${req.url}`);
    next();
  },

  authenticateJWT,
  getUserDetails
);

router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json(session);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Unable to retrieve session' });
  }
});

router.get('/notifications/unread', authenticateJWT, fetchUnreadNotificationsCount);
router.post('/notifications/clear', authenticateJWT, markNotificationsAsRead);
router.get('/notifications', authenticateJWT, fetchUserNotifications);
router.post('/notifications/:notificationId', authenticateJWT, markSingleNotificationRead);
router.get('/parking/reservations', authenticateJWT, getUpcomingReservations);
router.post('/cancel-subscription', authenticateJWT, cancelSubscription);
router.get('/parkinglots', getParkingLotCities);
router.get('/user-subscription', authenticateJWT, getUserSubscription);
//im aware the the router below doesn'tfully follow restful conventions by not usind :id. however i chose this approach in order to edit bulk items
router.put('/cars/:idCars', authenticateJWT, updateCar);
router.get('/subscriptions', getSubscriptionTiers);
router.post('/signup', addUserController);
router.post('/login', loginLimiter, login);
router.post('/logout', authenticateJWT, logout);
router.get('/parking/slots-count/:cityId', authenticateJWT, countSlotsByCityID);
router.patch('/:id', authenticateJWT, updateUser);
router.post('/cars/add', authenticateJWT, addCarsController);
router.delete('/cars/:idCars', authenticateJWT, deleteCarById);
router.get('/cars', authenticateJWT, getUserCars);
router.get('/parking/total-time', authenticateJWT, calculateTotalParkingTimeByUser);
router.get('/parking/average-duration', authenticateJWT, calculateAverageParkingTimeByUser);
router.post('/parking/reservation', authenticateJWT, bookSlotController);
//here also i decided to not use /:id in order to be able to keep the same controller and model to work with both admin and user
//important- idReservation in the req.body
//if anyone is signed in- we will know who it is and make sure that he can't delete a reservation that isnt his
//on the other hand no one can access the admin route without the api key
router.delete('/parking/reservation', authenticateJWT, cancelReservationController);
//use params
router.get('/parking/find-best-slot', authenticateJWT, findAvailableSlotController);
router.get('/parking/history', authenticateJWT, getParkingHistory);
router.delete('/:id', authenticateJWT, deleteUser);

///TODO****** add a middleware to check if subscription is active
router.get('/google/callback', googleCallback);
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);
router.post('/webhook', handleCheckoutSessionCompleted);
router.post('/create-checkout-session', authenticateJWT, createStripeSession);

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
