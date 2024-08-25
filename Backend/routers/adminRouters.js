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
  reserveParkingController,
  cancelReservationController
} = require('../controllers/parkingController');
const { googleCallback } = require('../controllers/authController');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);
const { apiKeyAuth } = require('../utils/apiKeyAuth');
const passport = require('passport');
const { createStripeSession } = require('../controllers/stripeCheckoutController');
const { handleCheckoutSessionCompleted } = require('../controllers/stripeWebHookController');

//eitan hits this route once a car gets out of the parking lot. will need to check if he had a reservation provide idCars
router.delete('/reservation', apiKeyAuth, cancelReservationController);

module.exports = router;
