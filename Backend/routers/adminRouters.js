const express = require('express');
const router = express.Router();
const { getParkingLotCities } = require('../controllers/parkingController');
const {
  addParkingLot,
  updateParkingLot,
  areasByCityID,
  addArea,
  updateArea,
  removeArea,
  deleteSlotsByIdRangeController,
  toggleSlot,
  addSlotsToArea,
  updateSubscriptionController,
  addSubscriptionController,
  removeSubscriptionController,
  removeParkingLot,
  mostActiveUsersController,
  viewSlotsByCriteriaController,
  updateIndividualSlot,
  updateSlotsByCriteriaController,
  deleteSlotsByStatusAreaCity,
  deleteSlotByIDController,
  viewUsersByCriteria,
  updateCityPicture,
  getUserDetails
} = require('../controllers/adminController');
const { getSubscriptionTiers } = require('../controllers/userController');
const { cancelReservationController, setExitTimeController } = require('../controllers/parkingController');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI);
const { apiKeyAuth } = require('../middlewares/apiKeyAuth');
const passport = require('passport');
const { checkAdminRole } = require('../middlewares/isAdmin');
const { toggleSubscriptionStatusById } = require('../models/adminModel');
const { authenticateJWT } = require('../middlewares/authenticateJWT');

router.use(authenticateJWT);
router.use(checkAdminRole);

router.post('/parking/add-parking-lot', addParkingLot); // OK
router.put('/parking/update-parking-lot/:idCities', updateParkingLot); // OK
router.delete('/parking/parkinglot/:idCities', removeParkingLot); // OK
router.get('/parking/all-parking-lots', getParkingLotCities); // OK
router.patch('/parking/picture/:idCities', updateCityPicture); // NEEDS TESTING

router.post('/parking/areas', addArea); //OK
router.delete('/parking/areas/:idAreas', removeArea); //OK
router.get('/parking/areas/:cityId', areasByCityID); //OK

router.delete('/parking/slots/:idSlots', deleteSlotByIDController); //OK
router.delete('/parking/slots/criteria/:cityID', deleteSlotsByStatusAreaCity); //OK

router.delete('/parking/slots/range', deleteSlotsByIdRangeController); //NEEDS TESTING
router.patch('/parking/slots/bulk-update', updateSlotsByCriteriaController); //OK
router.post('/parking/slots/changestatus/:id', toggleSlot); //activate/deactivate
router.get('/parking/slots', viewSlotsByCriteriaController); //OK
router.patch('/parking/slots/update/:idSlots', updateIndividualSlot); //OK
router.post('/parking/slots/add', addSlotsToArea); //OK  although need to decide what to do with borderright and ips

router.post('/subscriptions', addSubscriptionController); //OK
router.patch('/subscriptions/:idSubscriptionPlans', updateSubscriptionController); //OK
router.delete('/subscriptions/:idSubscriptionPlans', removeSubscriptionController); //OK
router.get('/subscriptions', getSubscriptionTiers); // OK

router.get('/users/mostactive', mostActiveUsersController); // ||OK
//status || fname || lname || subscriptionTier || email || violations || role
//http://localhost:3001/api/admin/users/criteria?role=user&subscriptionTier=Single%20Plan  example
router.get('/users/criteria', viewUsersByCriteria); // ||OK
router.patch('/users/subscriptions/:subscriptionId', toggleSubscriptionStatusById); //not sure needed yet

// route for occupancy- take from parking controller

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
