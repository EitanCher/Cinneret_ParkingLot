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
  slotsByStatusAreaCity,
  updateIndividualSlot,
  updateSlotsByCriteriaController,
  deleteSlotsByStatusAreaCity,
  deleteSlotByIDController,
  viewUsersByCriteria
} = require('../controllers/adminController');
const { getSubscriptionTiers } = require('../controllers/userController');
const { cancelReservationController, setExitTimeController } = require('../controllers/parkingController');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI);

const { apiKeyAuth } = require('../middlewares/apiKeyAuth');
const passport = require('passport');
const { checkAdminRole } = require('../middlewares/isAdmin');
const { toggleSubscriptionStatusById } = require('../models/adminModel');

router.use(passport.authenticate('jwt', { session: false }));
router.use(checkAdminRole);

router.post('/parking/add-parking-lot', addParkingLot); //Tested || OK
router.put('/parking/update-parking-lot/:idCities', updateParkingLot); //Tested || OK
router.delete('/parking/parkinglot/:idCities', removeParkingLot); //Tested || OK
router.get('/parking/all-parking-lots', getParkingLotCities); //Tested || OK

//NEEDS TESTING

router.post('/parking/areas', addArea); //Tested || OK
router.delete('/parking/areas/:idAreas', removeArea); //Tested || OK
router.get('/parking/areas/:cityId', areasByCityID);

router.delete('/parking/slots/:slotID', deleteSlotByIDController);
router.delete('/parking/slots/criteria/:cityID', deleteSlotsByStatusAreaCity);
router.delete('/parking/slots/range', deleteSlotsByIdRangeController);
router.patch('/parking/slots/bulk-update', updateSlotsByCriteriaController); //this already has a toggle for status tbh
router.post('/parking/slots/changestatus/:id', toggleSlot); //activate/deactivate
router.get('/parking/slots', slotsByStatusAreaCity);
router.patch('/parking/slots/update/:idSlots', updateIndividualSlot);
router.post('/parking/slots/add', addSlotsToArea);

router.patch('/subscriptions/:subscriptionId', updateSubscriptionController);
router.post('/subscriptions', addSubscriptionController);
router.delete('/subscriptions/:subscriptionId', removeSubscriptionController);
router.get('/subscriptions', getSubscriptionTiers);

router.get('/users/mostactive', mostActiveUsersController);
router.get('/users/criteria', viewUsersByCriteria);
router.patch('/users/subscriptions/:subscriptionId', toggleSubscriptionStatusById);
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
