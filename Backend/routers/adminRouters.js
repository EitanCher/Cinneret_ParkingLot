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
  addSlotsToArea,
  updateSubscriptionController,
  addSubscriptionController,
  removeSubscriptionController,
  removeParkingLot,
  mostActiveUsersController,
  viewSlotsByCriteriaController,
  updateIndividualSlot,
  deleteSlotByIDController,
  viewUsersByCriteria,
  updateCityPicture,
  getUserDetails,
  userCountController,
  incomeByTimeFrame,
  getParkingLotsFaultsController,
  getRecentSubscriptionsController,
  calculateAverageParkingTimeAllUsersController,
  getRecentParkingLogsController,
  addIndividualSlot,
  editArea,
  addGateToCity,
  getGatesByCityController,
  deleteGate,
  editGate,
  createNotification
} = require('../controllers/adminController');
const { getSubscriptionTiers } = require('../controllers/userController');
const { cancelReservationController, setExitTimeController } = require('../controllers/parkingController');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI);
const { apiKeyAuth } = require('../middlewares/apiKeyAuth');
const passport = require('passport');
const { checkAdminRole } = require('../middlewares/isAdmin');
const { toggleSubscriptionStatusById, getUserCounts } = require('../models/adminModel');
const { authenticateJWT } = require('../middlewares/authenticateJWT');

router.use(authenticateJWT);
router.use(checkAdminRole);

router.post('/parking/gates/add', addGateToCity);
router.get('/parking/gates/:idCities', getGatesByCityController);
router.delete('/parking/gates/:idGates', deleteGate);
router.put('/parking/gates/:idGates', editGate);

router.post('/notifications', createNotification);

router.post('/parking/slots/add-individual', addIndividualSlot);
router.get('/parking/recent-parking-logs', getRecentParkingLogsController);
router.get('/parking/average-parking-time', calculateAverageParkingTimeAllUsersController);
router.get('/income-by-dates', incomeByTimeFrame);
router.post('/parking/add-parking-lot', addParkingLot);
router.put('/parking/update-parking-lot/:idCities', updateParkingLot);
router.delete('/parking/parkinglot/:idCities', removeParkingLot);
router.get('/parking/all-parking-lots', getParkingLotCities);
router.patch('/parking/picture/:idCities', updateCityPicture); // NEEDS TESTING
router.get('/users/counts', userCountController);
router.post('/parking/areas', addArea);
router.put('/parking/areas/:idAreas', editArea);
router.delete('/parking/areas/:idAreas', removeArea);
router.get('/parking/areas/:idCities', areasByCityID);
router.get('/parking/faulty/:cityId', getParkingLotsFaultsController); //send city id for city faults. or leave empty for all cities faults
router.delete('/parking/slots/:idSlots', deleteSlotByIDController);
router.get('/users/recent/', getRecentSubscriptionsController);
router.get('/parking/slots', viewSlotsByCriteriaController);
router.patch('/parking/slots/update/:idSlots', updateIndividualSlot);
router.post('/parking/slots/add', addSlotsToArea);
router.post('/subscriptions', addSubscriptionController);
router.patch('/subscriptions/:idSubscriptionPlans', updateSubscriptionController);
router.delete('/subscriptions/:idSubscriptionPlans', removeSubscriptionController);
router.get('/subscriptions', getSubscriptionTiers);

router.get('/users/mostactive', mostActiveUsersController);
//status || fname || lname || subscriptionTier || email || violations || role
//http://localhost:3001/api/admin/users/criteria?role=user&subscriptionTier=Single%20Plan  example
router.get('/users/criteria', viewUsersByCriteria);
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
