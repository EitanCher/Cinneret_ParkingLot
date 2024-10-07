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
  createReservation,
  findBestSlot,
  fetchParkingHistoryByUserId,
  fetchTotalParkingTimeByUser,
  fetchAverageParkingTimeByUser,
  findCityById,
  countSlotsByCityId,
  countActivePendingReservations
} = require('../models/parkingModel');
const passport = require('../utils/passport-config');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let maxDurationReservation = 24;
let maxDurationParkingNoReservation = 6;

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
    console.log('Start of try block in find slot controller');
    const { idCities, StartDate } = req.query;

    const cityID = parseInt(idCities, 10);
    if (isNaN(cityID) || !StartDate) {
      return res.status(400).json({ error: 'idCities and StartDate are required and idCities must be a valid number' });
    }

    const startDateTime = new Date(StartDate);
    const localDate = new Date(startDateTime.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));

    if (isNaN(localDate.getTime())) {
      return res.status(400).json({ error: 'Invalid StartDate format' });
    }

    console.log('Hitting find best slot model');
    const bestSlotResult = await findBestSlot(cityID, localDate);

    if (!bestSlotResult.success) {
      return res.status(400).json({ error: bestSlotResult.message });
    }

    return res.status(200).json({
      slots: bestSlotResult.slots
    });
  } catch (error) {
    console.error('Error finding available slot:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const bookSlotController = async (req, res) => {
  try {
    console.log('Incoming booking request:', req.body);
    const stringFields = ['slotId', 'StartDate', 'EndDate', 'idCars'];
    const sanitizedBody = sanitizeObject(req.body, stringFields);
    const { slotId, StartDate, EndDate, idCars } = sanitizedBody;

    console.log('Sanitized request body:', sanitizedBody);

    const idUsers = req.user.id;
    if (!idUsers) {
      console.log('User not logged in.');
      return res.status(401).send({ error: 'User not logged in' });
    }

    if (!slotId || !StartDate || !EndDate || !idCars) {
      console.log('Missing required fields:', { slotId, StartDate, EndDate, idCars });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const startDateTime = new Date(StartDate);
    const endDateTime = new Date(EndDate);
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      console.log('Invalid date format:', { StartDate, EndDate });
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Validate duration
    const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    console.log('Calculated Duration in Hours:', durationHours);
    if (durationHours <= 0 || durationHours > maxDurationReservation) {
      console.log('Invalid Duration:', durationHours);
      return res.status(400).json({
        error: `Your requested parking duration of ${durationHours} exceeds the maximum of ${maxDurationReservation} hours`
      });
    }

    // Validate that the car belongs to the user
    console.log('Fetching user cars for user ID:', idUsers);
    const userCars = await fetchAllCarIdsByUserID(idUsers);
    if (!userCars.includes(idCars)) {
      console.log('User attempting to book a reservation for a non-owned car:', idCars);
      return res.status(403).json({ error: 'Cannot book a reservation for a car that does not belong to you' });
    }

    // Check active and pending reservations
    console.log('Checking active and pending reservations for user ID:', idUsers);
    const activeAndPendingReservations = await countActivePendingReservations(userCars);

    // Retrieve max allowed reservations for the user
    console.log('Retrieving max allowed reservations for user ID:', idUsers);
    const maxReservations = await maxReservationsByUser(idUsers);

    if (!maxReservations) {
      console.log('No max reservations found for this user.');
      return res.status(403).json({ error: 'Unable to determine the maximum allowed reservations for your subscription.' });
    }

    console.log('Current active/pending reservations:', activeAndPendingReservations);
    console.log('Max allowed reservations:', maxReservations);

    if (activeAndPendingReservations >= maxReservations) {
      console.log('Reservation limit reached for user ID:', idUsers);
      return res.status(403).json({
        error: 'Cannot create more reservations; limit reached',
        maxReservations
      });
    }

    // Create the reservation with the provided time range
    console.log('Creating reservation with data:', {
      userId: idUsers,
      carId: idCars,
      slotId,
      startDateTime,
      endDateTime
    });
    const reservation = await createReservation(idUsers, idCars, slotId, startDateTime, endDateTime);
    console.log('Reservation created:', reservation);
    return res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (error) {
    console.log('Error booking slot:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

//supposed to be suited to both users and system
//users authenticate with jwt, system authenticates with api key
//users will send idUsers and idReservation
//system will send idCars which will transalte to idReservation

// needs to cancel reservation only if reservation exists and the car actually used it.

const cancelReservationController = async (req, res) => {
  try {
    const { idReservation } = req.body;

    if (!idReservation) {
      return res.status(400).json({ error: 'Reservation ID is required' });
    }

    const userId = req.user.id;

    const reservation = await prisma.reservations.findFirst({
      where: {
        idReservation: idReservation,
        UserID: userId // Ensure the reservation belongs to the authenticated user
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found or you do not have permission to cancel this reservation' });
    }
    console.log('about to delete reservation');

    await prisma.reservations.delete({
      where: {
        idReservation: idReservation
      }
    });

    res.status(200).json({ message: 'Reservation canceled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//combine to also take care of slotid and reservation id if he has a reservation
const setExitTimeController = async (req, res) => {
  const idCars = parseInt(req.params.id, 10); // Ensure idCars is a number
  const idParkingLog = parseInt(req.params.idParkingLog, 10); // Ensure idParkingLog is a number

  try {
    // Fetch the reservation asynchronously
    const reservation = await fetchReservationsByCarID(idCars);

    // Get the current time as a timestamp with time zone
    const currentTime = new Date();

    let exitTime;

    // Set exit time based on whether there is a reservation
    if (!reservation) {
      exitTime = new Date(currentTime.getTime() + maxDurationParkingNoReservation * 60 * 60 * 1000);
    } else {
      // Set exit time according to reservation start
      exitTime = new Date(reservation.ReservationStart.getTime() + maxDurationReservation * 60 * 60 * 1000);
    }

    // Update the ParkingLog in the database
    const response = await prisma.parkingLog.update({
      where: {
        idParkingLog: idParkingLog
      },
      data: {
        ReservationID: reservation ? reservation.idReservation : null, // Use null if no reservation
        NeedToExitBy: exitTime
      }
    });

    // Return a success response
    return res.status(200).json({ message: 'Exit time set successfully', response });
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

const countSlotsByCityID = async (req, res) => {
  try {
    const { cityId } = req.params;
    // Validate cityId
    if (!cityId || isNaN(cityId)) {
      return res.status(400).json({ error: 'Valid cityId is required.' });
    }

    const parsedCityId = parseInt(cityId, 10);

    // Check if the city exists using the model
    const city = await findCityById(parsedCityId);
    if (!city) {
      return res.status(404).json({ error: 'City not found.' });
    }

    // Count the number of slots (total and busy) using the model
    const { totalSlotsCount, availableSlotsCount } = await countSlotsByCityId(parsedCityId);

    // Return the results
    return res.status(200).json({
      cityId: parsedCityId,
      totalSlotsCount,
      availableSlotsCount
    });
  } catch (error) {
    console.error('Error counting slots:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//recent parking logs

const countSlotsByCityName = () => {};
module.exports = {
  getParkingLotCities,
  cancelReservationController,
  bookSlotController,
  setExitTimeController,
  findAvailableSlotController,
  getParkingHistory,
  calculateTotalParkingTimeByUser,
  calculateAverageParkingTimeByUser,
  countSlotsByCityID
};
