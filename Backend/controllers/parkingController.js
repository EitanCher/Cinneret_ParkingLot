const { sanitizeObject } = require('../utils/xssUtils');
const prisma = require('../prisma/prismaClient');
const jwt = require('jsonwebtoken');
const {
  getAllParkingLots,
  countActiveReservations,
  fetchAllCarIdsByUserID,
  maxReservationsByUser,
  findAndBookSlot,
  cancelReservation
} = require('../models/parkingModel');
const passport = require('../utils/passport-config'); // Import from the correct path
const bcrypt = require('bcrypt');
const saltRounds = 10;

const maxDurationReservation = 72;
const maxDurationParkingNoReservation = 12;
const getParkingLotCities = async (req, res) => {
  try {
    // Fetch the list of cities
    const parkingLots = await getAllParkingLots();

    // Extract CityName values into a simple array
    const cityNames = parkingLots.cities.map((city) => city.CityName);

    // Respond with the array of city names
    res.json(cityNames);
  } catch (error) {
    console.error('Error getting parking lots:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const reserveParkingController = async (req, res) => {
  try {
    const stringFields = [
      'CityName',
      'StartDate',
      'Duration'
      // Add other fields you want to sanitize
    ];
    console.log('start of try block in controller');
    const idUsers = req.user.idUsers;
    console.log('idUsers: ' + idUsers);
    const sanitizedBody = sanitizeObject(req.body, stringFields);
    console.log('sanitizedBody: ' + JSON.stringify(sanitizedBody));
    const { idCars, CityName, idCities, StartDate, Duration } = sanitizedBody;
    if (!idUsers) {
      return res.status(401).send({ error: 'User not logged in' });
    }
    if (!CityName || !StartDate || !Duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (Duration > maxDurationReservation)
      return res.status(400).json({
        error: `your requested parking duration of ${Duration} exceeded the maximum of ${maxDurationReservation}`
      });

    const MaxReservations = await maxReservationsByUser(idUsers);
    const userCardIDsArr = await fetchAllCarIdsByUserID(idUsers);
    const currentReservations = await countActiveReservations(userCardIDsArr);
    if (!userCardIDsArr.includes(idCars))
      return res.status(403).json({ error: 'You cannot reserve a parking spot for a car that does not belong to you' });

    if (currentReservations >= MaxReservations) {
      return res.status(403).send({ error: 'Maximum number of reservations reached' });
    }
    const startDateTime = new Date(StartDate);
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid StartDate format' });
    }
    const endDateTime = new Date(startDateTime.getTime() + Duration * 60 * 60 * 1000); // Duration in hours
    const reservationResult = await findAndBookSlot(idCities, idCars, idUsers, startDateTime, endDateTime);
    // If no reservation is made, return a 404 status with an appropriate error message
    if (!reservationResult) {
      return res.status(404).json({ error: 'No available slots found for the specified criteria' });
    }

    // If a reservation was successfully made, return the reservation details
    return res.status(201).json({ message: 'Reservation successful', reservation: reservationResult });
  } catch (error) {
    console.error('Error reserving parking:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

//supposed to be suited to both users and system
//users authenticate with jwt, system authenticates with api key
//users will send idUsers and idReservation
//system will send idCars which will transalte to idReservation
const cancelReservationController = async (req, res) => {
  try {
    // Extract the user's ID from the authenticated request
    const idUsers = req.user ? req.user.idUsers : null;

    // Extract reservation ID or car ID from the request body
    const { idReservation, idCars } = req.body;
    console.log('idReservations from req.body is: ' + idReservation);
    console.log('idUsers from req.user is: ' + idUsers);
    console.log('idCars from req.body is: ' + idCars);

    let reservationIdToCancel = idReservation;

    // If idReservation is not provided, find it using idCars
    if (!idReservation && idCars) {
      const reservation = await prisma.reservations.findUnique({
        where: {
          carId: idCars // Assuming carId is the foreign key in the reservations table
        }
      });
      console.log('reservation variable (const) is: ' + reservation);
      if (reservation) {
        reservationIdToCancel = reservation.idReservation;
      } else {
        return res.status(404).json({ error: 'Reservation not found for the provided car ID' });
      }
    }

    // Call the model function to cancel the reservation
    await cancelReservation(reservationIdToCancel, idUsers);
    res.status(200).json({ message: 'Reservation canceled successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Handle Zod validation errors
      return res.status(400).json({
        error: 'Validation error',
        details: err.errors // Include details of validation errors
      });
    }

    console.error('Error cancelling reservation:', err.message);

    if (err.message === 'Reservation not found') {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (err.message === 'Unauthorized to cancel this reservation') {
      return res.status(403).json({ error: 'Unauthorized to cancel this reservation' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getParkingLotCities,
  reserveParkingController,
  cancelReservationController
};
