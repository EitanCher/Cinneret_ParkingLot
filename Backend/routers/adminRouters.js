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
  cancelReservationController,
  setExitTimeController
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

//System endpints

//eitan hits this route once a car gets out of the parking lot. will need to check if he had a reservation provide idCars
//needs to be tested
router.delete('/parking/reservation', apiKeyAuth, cancelReservationController);

//once a car enters the parking lot we need to assign carid,entrance,needtoexitby and reservationid to the parking log.
//slot id assigned when he enters the slot

// when car enters the parking lot we need to designate a lot because some may be reserved.
//find a slot that is avilable right now for the longest time (up to max reservation time) and designate it to the car
//show the car the maximum time he can park for.
//slot cant be a reserved one
router.post('/parking/log/exittime/:idCars', apiKeyAuth, setExitTimeController);

module.exports = router;
