const { sanitizeObject } = require('../utils/xssUtils');
const prisma = require('../prisma/prismaClient');
const jwt = require('jsonwebtoken');
const {
  getAllParkingLots,
  countActiveReservations,
  fetchAllCarIdsByUserID,
  maxReservationsByUser,
  findAndBookSlot,
  cancelReservation,
  fetchReservationsByCarID,
  setExitTimeModel,
  createReservation,
  findBestSlot,
  fetchParkingHistoryByUserId,
  fetchTotalParkingTimeByUser,
  fetchAverageParkingTimeByUser
} = require('../models/parkingModel');
const passport = require('../utils/passport-config');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const maxDurationReservation = 24;
const maxDurationParkingNoReservation = 6;

const getParkingLotCities = async (req, res) => {
  try {
    console.log('start of try block in parking controller');
    // Fetch the list of cities
    const parkingLots = await getAllParkingLots();

    // Respond with the array of city names
    res.json(parkingLots);
  } catch (error) {
    console.error('Error getting parking lots:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const findAvailableSlotController = async (req, res) => {
  try {
    const { idCities, StartDate } = req.query;

    const cityID = parseInt(idCities, 10);
    if (isNaN(cityID) || !StartDate) {
      return res.status(400).json({ error: 'idCities and StartDate are required and idCities must be a valid number' });
    }
    const startDateTime = new Date(StartDate);
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid StartDate format' });
    }

    // Find the best slot
    const bestSlotResult = await findBestSlot(cityID, startDateTime);
    if (!bestSlotResult) {
      return res.status(404).json({ error: 'No available slots found for the specified criteria' });
    }

    // Return the best slot and the maximum duration available
    return res.status(200).json({
      slot: bestSlotResult.slot,
      maxDuration: bestSlotResult.maxDuration
    });
  } catch (error) {
    console.error('Error finding available slot:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const bookSlotController = async (req, res) => {
  try {
    // Define fields to be sanitized
    const stringFields = ['slotId', 'StartDate', 'Duration', 'idCars'];

    // Sanitize the request body
    const sanitizedBody = sanitizeObject(req.body, stringFields);
    const { slotId, StartDate, Duration, idCars } = sanitizedBody;

    // Log sanitized body for debugging
    console.log('Sanitized body:', sanitizedBody);

    // Get the user ID from JWT (assuming `req.user.idUsers` is populated by authentication middleware)

    const idUsers = req.user.idUsers;
    if (!idUsers) {
      return res.status(401).send({ error: 'User not logged in' });
    }

    // Validate required fields
    if (!slotId || !StartDate || !Duration || !idCars) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate StartDate format
    const startDateTime = new Date(StartDate);
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid StartDate format' });
    }

    // Validate Duration
    if (Duration <= 0 || Duration > maxDurationReservation) {
      return res.status(400).json({
        error: `Your requested parking duration of ${Duration} exceeds the maximum of ${maxDurationReservation}`
      });
    }

    // Fetch the user’s cars
    const userCars = await fetchAllCarIdsByUserID(idUsers);
    if (!userCars.includes(idCars)) {
      return res.status(403).json({ error: 'Cannot book a reservation for a car that does not belong to you' });
    }

    // Check current active reservations
    const activeReservationsCount = await countActiveReservations(userCars);

    // Get the max allowed reservations for the user’s subscription plan
    const maxReservations = await maxReservationsByUser(idUsers);

    // Ensure the user has not exceeded their reservation limit
    if (activeReservationsCount >= maxReservations) {
      return res.status(403).json({ error: 'Cannot create more reservations; limit reached' });
    }

    // Create the reservation
    const reservation = await createReservation(idUsers, idCars, slotId, startDateTime, Duration);
    return res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (error) {
    console.error('Error booking slot:', error.message);
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

const setExitTimeController = async (req, res) => {
  const idCars = parseInt(req.params.id, 10); // Ensure idCars is a number

  try {
    // Fetch the reservation asynchronously
    const reservation = await fetchReservationsByCarID(idCars);

    // Get the current time as a timestamp with time zone
    const currentTime = new Date();

    let exitTime;

    // Set exit time on parking log according to the current entrance (no reservation)
    if (!reservation) {
      exitTime = new Date(currentTime.getTime() + maxDurationParkingNoReservation * 60 * 60 * 1000);
    } else {
      // Set exit time according to reservation start
      exitTime = new Date(reservation.startDate.getTime() + maxDurationReservation * 60 * 60 * 1000);
    }

    // Call the model to update the exit time in the database
    await setExitTimeModel(idCars, exitTime);

    // Return a success response
    return res.status(200).json({ message: 'Exit time set successfully', exitTime });
  } catch (error) {
    // Handle specific errors from models or validation
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error setting exit time:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

//search by   { startDate, endDate, registration, slotNumber, carModel, violationStatus }
//NEEDS TESTING
const getParkingHistory = async (req, res) => {
  try {
    const idUsers = req.user.idUsers;

    if (!idUsers) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    // Extract query parameters
    const { startDate, endDate, registration, slotNumber, carModel, violationStatus } = req.query;

    // Fetch the parking log history for the user
    const parkingLogs = await fetchParkingHistoryByUserId(idUsers, {
      startDate,
      endDate,
      registration,
      slotNumber,
      carModel,
      violationStatus
    });

    // Check if any logs exist
    if (!parkingLogs || parkingLogs.length === 0) {
      return res.status(404).json({ message: 'No parking history found for this user' });
    }

    // Return the parking log history
    res.status(200).json({ parkingLogs });
  } catch (error) {
    console.error('Error retrieving parking log history:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

//NEEDS TESTING
const calculateTotalParkingTimeByUser = async (req, res) => {
  try {
    const idUsers = req.user.idUsers;

    if (!idUsers) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    // Fetch the total parking time for the user
    const totalParkingTime = await fetchTotalParkingTimeByUser(idUsers);

    // Return the total parking time
    res.status(200).json({ totalParkingTime });
  } catch (error) {
    console.error('Error calculating total parking time:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};
//NEEDS TESTING
const calculateAverageParkingTimeByUser = async (req, res) => {
  try {
    const idUsers = req.user.idUsers;

    if (!idUsers) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    // Fetch the average parking time for the user
    const averageParkingTime = await fetchAverageParkingTimeByUser(idUsers);

    // Return the average parking time
    if (averageParkingTime) res.status(200).json({ averageParkingTime });
    else {
      res.status(404).json({ message: 'No parking history found for this user' });
    }
  } catch (err) {
    console.error('Error calculating average parking time:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
module.exports = {
  getParkingLotCities,
  cancelReservationController,
  bookSlotController,
  setExitTimeController,
  findAvailableSlotController,
  getParkingHistory,
  calculateTotalParkingTimeByUser,
  calculateAverageParkingTimeByUser
};
