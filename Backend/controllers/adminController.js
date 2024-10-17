const xss = require('xss');
const { getIO } = require('../io'); // Access the io instance

const { deleteUserById, updateUserById, getSubscriptions, createUser } = require('../models/userModel');
const {
  getUsersWithActiveSubscriptions,
  addSlotsBulk,
  addSubscription,
  getSubscriptionPlanByID,
  updateSubscriptionPlanByID,
  deleteSubscriptionPlanByID,
  calculateAvgParkingTimeForAll,
  calculateMostActiveUsers,
  calculateIncomeByTimeFrame,
  viewSlotsByCriteria,
  updateSlotByID,
  updateSlotsByCriteria,
  deleteSlotByID,
  getUsersByCriteria,
  toggleSubscriptionStatusById,
  getAllUsers,
  getUserCounts,
  getParkingLotsFaultsModel,
  getRecentSubscriptionsModel,
  calculateAverageParkingTimeAllUsers,
  getRecentParkingLogs,
  addIndividualSlotModel,
  addGate,
  getGatesByCity
} = require('../models/adminModel');
const { getAreaIdsByCityId } = require('../models/parkingModel');
const { z } = require('zod'); // Import Zod for validation
const {
  updateUserSchema,
  CityCreateSchema,
  CityUpdateSchema,
  AreaCreateSchema,
  AreaUpdateSchema,
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  userSubscriptionSchema,
  addUserControllerSchema,
  hwAliveSchema
} = require('../db-postgres/zodSchema');
const { sanitizeObject } = require('../utils/xssUtils');
const prisma = require('../prisma/prismaClient');

async function updateCityPicture(req, res) {
  try {
    const { idCities } = parseInt(req.params.idCities, 10);
    const stringFields = ['pictureUrl'];
    const sanitizedData = sanitizeObject(req.body, stringFields);
    const { pictureUrl } = sanitizedData;
    CityUpdateSchema.parse({ idCities, pictureUrl });

    const city = await prisma.cities.findUnique({
      where: {
        idCities: idCities
      }
    });
    if (!city) return res.status(404).json({ message: 'City not found' });

    // Update the city picture in the database
    const updatedCity = await prisma.cities.update({
      where: {
        idCities: idCities
      },
      data: { pictureUrl }
    });

    return res.status(200).json({
      message: 'City picture updated successfully',
      CityName: updatedCity.CityName,
      FullAddress: updatedCity.FullAddress,
      pictureUrl: updatedCity.pictureUrl
    });
  } catch (error) {
    console.error('Error updating city picture:', error);

    // Improved error handling
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }

    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function addParkingLot(req, res) {
  try {
    const sanitizedData = sanitizeObject(req.body, ['CityName', 'FullAddress', 'pictureUrl']);
    const { CityName, FullAddress, pictureUrl } = sanitizedData;

    // Validate input with schema
    CityCreateSchema.parse({ CityName, FullAddress, pictureUrl });

    // Create the city record in the database
    const city = await prisma.cities.create({
      data: { CityName, FullAddress, pictureUrl }
    });

    if (!city) {
      return res.status(500).json({ message: 'Failed to add city' });
    }

    // Return the created city details
    return res.status(201).json({
      CityName: city.CityName,
      FullAddress: city.FullAddress,
      pictureUrl: city.pictureUrl
    });
  } catch (error) {
    console.error('Error adding city:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

//NEEDS TESTING
async function updateParkingLot(req, res) {
  try {
    // Parse and validate city ID from request parameters
    const idCities = parseInt(req.params.idCities, 10); // Ensure this matches the route parameter name
    console.log('idCities in controller:', idCities);

    if (isNaN(idCities)) {
      return res.status(400).json({ message: 'Invalid city ID provided' });
    }

    // Sanitize input data (make sure the sanitizeObject function is correctly implemented)
    const sanitizedData = sanitizeObject(req.body, ['CityName', 'FullAddress', 'pictureUrl']);
    console.log('Sanitized data:', sanitizedData);

    // Destructure the sanitized fields
    const { CityName, FullAddress, pictureUrl } = sanitizedData;

    // Validate input with schema (ensure CityUpdateSchema is correctly defined)
    CityUpdateSchema.parse({ CityName, FullAddress, pictureUrl });

    // Update the city record in the database
    const updatedCity = await prisma.cities.update({
      where: { idCities: idCities },
      data: { CityName, FullAddress, pictureUrl }
    });

    if (!updatedCity) {
      return res.status(404).json({ message: 'City not found' });
    }

    // Return the updated city details
    return res.status(200).json({
      idCities: updatedCity.idCities, // Ensure that updatedCity has an idCities field
      CityName: updatedCity.CityName,
      FullAddress: updatedCity.FullAddress,
      pictureUrl: updatedCity.pictureUrl
    });
  } catch (error) {
    console.error('Error updating city:', error); // Log the entire error object for better debugging
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

async function removeParkingLot(req, res) {
  try {
    const idCities = parseInt(req.params.idCities, 10); // Parse the city ID from request parameters
    console.log('idCities:', idCities);

    if (isNaN(idCities)) {
      return res.status(400).json({ message: 'Invalid city ID' });
    }

    // Fetch all area IDs associated with the city
    const areaIds = await prisma.areas.findMany({
      where: { CityID: idCities },
      select: { idAreas: true }
    });

    if (!areaIds.length) {
      return res.status(404).json({ message: 'No areas found for the given city ID' });
    }

    const areaIdsArray = areaIds.map((area) => area.idAreas);

    // Delete all slots associated with the fetched area IDs
    await prisma.slots.deleteMany({
      where: {
        AreaID: { in: areaIdsArray }
      }
    });

    // Delete all areas associated with the city ID
    await prisma.areas.deleteMany({
      where: { CityID: idCities }
    });

    // Finally, delete the city itself
    const deletedCity = await prisma.cities.delete({
      where: { idCities: idCities }
    });

    if (!deletedCity) {
      return res.status(404).json({ message: 'City not found' });
    }

    return res.status(200).json({ message: `City '${deletedCity.CityName}' has been deleted along with its areas and slots` });
  } catch (err) {
    console.error('Error removing city:', err.message); // Log the error message
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function editArea(req, res) {
  try {
    console.log('Start of try block in editArea function');

    const { idAreas } = req.params;
    const { AreaName } = req.body;

    console.log('ID of area being updated:', idAreas);
    console.log('New AreaName provided:', AreaName);

    // Check if an area with the same AreaName already exists, but exclude the current area being updated
    const existingArea = await prisma.areas.findFirst({
      where: {
        AreaName: AreaName,
        NOT: { idAreas: parseInt(idAreas, 10) } // Exclude the current area
      }
    });

    if (existingArea) {
      // If an area with the same AreaName exists, return a 409 conflict error
      return res.status(409).json({ message: 'Area with this name already exists' });
    }

    // Sanitize and update the area name
    const sanitizedData = sanitizeObject(req.body, ['AreaName']);

    // Perform the update
    const updatedArea = await prisma.areas.update({
      where: { idAreas: parseInt(idAreas, 10) },
      data: { ...sanitizedData }
    });

    return res.status(200).json({ message: 'Area updated successfully', updatedArea });
  } catch (error) {
    console.error('Error updating area:', error);

    // If there was a Prisma error (e.g., record not found), send a 404 status
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Area not found' });
    }

    // If unique constraint error (P2002), send 409 conflict status
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Area with this name already exists' });
    }

    // Send a generic 500 status for other errors
    return res.status(500).json({ message: 'An error occurred while updating the area' });
  }
}

//NEEDS TESTING
async function areasByCityID(req, res) {
  try {
    const { idCities } = req.params;
    console.log('idCities:', idCities);
    const cityIDInt = parseInt(idCities, 10);
    const areas = await prisma.areas.findMany({
      where: { CityID: cityIDInt },
      select: { idAreas: true, AreaName: true }
    });

    if (areas.length === 0) {
      return res.status(404).json({ message: 'City not found' });
    }
    console.log('areas:', areas);
    // Return the area IDs and names associated with the city
    return res.status(200).json({
      areas: areas.map((area) => ({
        idAreas: area.idAreas,
        AreaName: area.AreaName
      }))
    });
  } catch (err) {
    // Handle the error
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while retrieving areas.' });
  }
}

//NEEDS TESTING

async function addArea(req, res) {
  try {
    // Log the incoming request body to check what is being sent
    console.log('Incoming Request Body:', req.body);

    // Sanitize and extract required data
    const sanitizedData = sanitizeObject(req.body, ['CityID', 'AreaName']);
    console.log('Sanitized Data:', sanitizedData);

    // Destructure the sanitized data to get CityID and AreaName
    const { CityID, AreaName } = sanitizedData;

    // Log types and values before validation
    console.log('CityID:', CityID, 'Type:', typeof CityID);
    console.log('AreaName:', AreaName, 'Type:', typeof AreaName);

    // Parse using Zod, ensure AreaCreateSchema expects an object with CityID and AreaName
    AreaCreateSchema.parse({ CityID, AreaName });

    // Create the area in the database
    const area = await prisma.areas.create({
      data: { CityID, AreaName }
    });

    // Check if area creation was successful
    if (!area) {
      return res.status(500).json({ message: 'Failed to add area' });
    }

    // Respond with success
    return res.status(201).json({ idAreas: area.idAreas, AreaName });
  } catch (err) {
    // Log the specific error for debugging
    console.error('Error adding area:', err);

    // Send appropriate error response
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    }

    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

//NEEDS TESTING

async function removeArea(req, res) {
  try {
    // Extract the area ID from the request parameters
    const { idAreas } = req.params;

    // Perform the deletion in the database
    const area = await prisma.areas.delete({
      where: { idAreas: Number(idAreas) } // Ensure idAreas is a number if your schema uses integer IDs
    });

    // Check if the deletion was successful and return appropriate response
    if (area) {
      return res.status(200).json({ message: 'Area successfully removed' });
    } else {
      return res.status(404).json({ message: 'Area not found' });
    }
  } catch (err) {
    console.error('Error removing area:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
//NEEDS TESTING

//NEEDS TESTING

//SUBSCRIPTIONS
//NEEDS TESTING  || ALREADY REFACTORED WITH A MODEL
async function addSubscriptionController(req, res) {
  try {
    const { Name, Price, MaxCars, MaxActiveReservations, Features } = req.body;
    const data = {
      name: Name,
      price: Price,
      maxCars: MaxCars,
      maxActiveReservations: MaxActiveReservations,
      features: Features
    };

    // Validate the input data with the Zod schema
    createSubscriptionPlanSchema.parse(data);

    // Call the model function to add subscription
    const subscription = await addSubscription(data);

    return res.status(201).json({
      idSubscriptionPlans: subscription.idSubscriptionPlans,
      Name: subscription.Name,
      Features: subscription.Features,
      Price: subscription.Price,
      MaxCars: subscription.MaxCars,
      MaxActiveReservations: subscription.MaxActiveReservations
    });
  } catch (err) {
    console.error('Error adding subscription:', err);
    return res.status(400).json({ message: 'Invalid data', errors: err.errors });
  }
}

async function updateSubscriptionController(req, res) {
  try {
    const idSubscriptionPlans = parseInt(req.params.idSubscriptionPlans, 10); // Convert to integer
    if (isNaN(idSubscriptionPlans)) {
      return res.status(400).json({ message: 'Invalid subscriptionId' });
    }
    const sanitizedData = sanitizeObject(req.body, ['Name', 'Features']);
    const { Name, Features } = sanitizedData;
    const { Price, MaxCars, MaxActiveReservations } = req.body;
    const data = { Name, Features, Price, MaxCars, MaxActiveReservations };
    const result = await updateSubscriptionPlanByID(idSubscriptionPlans, data);
    if (!result) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    return res.status(200).json({
      message: 'Subscription plan updated successfully',
      subscription: result
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function removeSubscriptionController(req, res) {
  try {
    const idSubscriptionPlans = parseInt(req.params.idSubscriptionPlans, 10);
    console.log('id in controller:' + idSubscriptionPlans);
    if (isNaN(idSubscriptionPlans)) {
      return res.status(400).json({ message: 'Invalid subscription ID' });
    }
    const result = await deleteSubscriptionPlanByID(idSubscriptionPlans);
    if (!result) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    return res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error removing subscription:', error);
    return res.status(500).json({ message: error.message });
  }
}

//NEEDS TESTING
async function avgParkingTimeForAll(req, res) {
  try {
    const avgParkingTime = await calculateAvgParkingTimeForAll();
    return res.status(200).json({ averageParkingTime: avgParkingTime });
  } catch (error) {
    console.error('Error calculating average parking time:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

//NEEDS TESTING
async function incomeByTimeFrame(req, res) {
  try {
    console.log('start of incomeByTimeFrame in admin controller');
    const { startDate, endDate } = req.query;
    console.log('Extracted from query:', { startDate, endDate });

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required.' });
    }

    // Convert query strings to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    console.log('Converted dates:', { startDateObj, endDateObj });

    const incomeData = await calculateIncomeByTimeFrame({ startDate: startDateObj, endDate: endDateObj });

    res.status(200).json(incomeData);
  } catch (error) {
    console.error('Error in incomeByTimeFrameController:', error.message);
    res.status(500).json({ error: 'An error occurred while calculating income.' });
  }
}

//NEEDS TESTING
async function mostActiveUsersController(req, res) {
  try {
    // Extract numUsers from query parameters or set a default value
    const numUsers = parseInt(req.query.numUsers, 10) || 10; // Default to 10 if not provided

    // Validate numUsers to ensure it's a positive number
    if (isNaN(numUsers) || numUsers <= 0) {
      return res.status(400).json({ message: 'Invalid number of users' });
    }

    // Call the function to calculate the most active users
    const result = await calculateMostActiveUsers(numUsers);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating most active users:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function addSlotsToArea(req, res) {
  try {
    const { idAreas, numOfSlots } = req.body;

    // Call the model function to add slots
    const result = await addSlotsBulk(idAreas, numOfSlots);

    res.status(200).json({
      message: `${numOfSlots} slots added successfully to area ${idAreas}`,
      count: result.count
    });
  } catch (err) {
    console.error('Error adding slots:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function addIndividualSlot(req, res) {
  try {
    console.log('Incoming request to add an individual slot.');

    const stringFields = ['CameraIP', 'SlotIP'];
    const sanitizedData = sanitizeObject(req.body, stringFields); // Sanitize incoming data

    // Destructure the sanitized data
    const { BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP } = sanitizedData;
    console.log('Sanitized data for new slot:', sanitizedData);

    // Call the model function to add a new slot
    const result = await addIndividualSlotModel({ BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP });

    // Return the result
    return res.status(201).json(result); // Return 201 Created status on success
  } catch (error) {
    console.error('Error adding slot:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// TODO view slots- add criteria (busy)
async function viewSlotsByCriteriaController(req, res) {
  try {
    // Parse query parameters
    console.log('req query active:', req.query.active);
    console.log('req query cityId:', req.query.cityId);
    console.log('req query areaId:', req.query.areaId);
    console.log('req query busy:', req.query.busy);

    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const cityId = req.query.cityId ? parseInt(req.query.cityId, 10) : undefined;
    const areaId = req.query.areaId ? parseInt(req.query.areaId, 10) : undefined;
    const busy = req.query.busy === 'true' ? true : req.query.busy === 'false' ? false : undefined;

    // Log parsed values for debugging
    console.log('Parsed Query Params:', { cityId, active, areaId, busy });

    // Check for required parameters
    if (!cityId) {
      return res.status(400).json({ error: 'cityId is required.' });
    }

    const result = await viewSlotsByCriteria(cityId, active, areaId, busy);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error viewing slots:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function updateIndividualSlot(req, res) {
  try {
    const { idSlots } = req.params;
    console.log('idslots in controller:', idSlots);

    const stringFields = ['CameraIP', 'SlotIP'];
    const sanitizedData = sanitizeObject(req.body, stringFields); // Sanitize incoming data

    const { BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP } = sanitizedData;
    console.log('Busy in controller:', Busy);

    const result = await updateSlotByID(idSlots, { BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP });

    if (result.message) {
      return res.status(404).json({ message: result.message });
    }

    // Return the updated slot data
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function deleteSlotByIDController(req, res) {
  try {
    const { idSlots } = req.params;
    const result = await deleteSlotByID(idSlots);
    if (!result) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    return res.status(200).json({ message: 'Slot deleted successfully', result });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the slot.' });
  }
}

//NEEDS TESTING
async function viewUsersByCriteria(req, res) {
  try {
    console.log('Request Query:', req.query);

    // Extract query parameters
    const { status, fname, lname, subscriptionTier, email, violations, role } = req.query;
    console.log('Extracted Query Parameters:', { status, fname, lname, subscriptionTier, email, violations, role });

    // Build the criteria object with consistent naming
    const criteria = {
      ...(status && { subscriptionStatus: status }), // Ensure this matches the model
      ...(fname && { FirstName: fname }), // Ensure this matches the model
      ...(lname && { LastName: lname }), // Ensure this matches the model
      ...(subscriptionTier && { SubscriptionPlanName: subscriptionTier }), // Ensure this matches the model
      ...(email && { Email: email }), // Ensure this matches the model
      ...(violations !== undefined && { Violations: parseInt(violations, 10) }), // Ensure this matches the model
      ...(role && { Role: role }) // Ensure this matches the model
    };

    console.log('Criteria object:', criteria);

    // Ensure that at least one criteria is present
    if (Object.keys(criteria).length === 0) {
      return res.status(400).json({ error: 'At least one criteria must be provided' });
    }

    // Fetch users by criteria
    const users = await getUsersByCriteria(criteria);

    // Send success response
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by criteria:', error);
    return res.status(500).json({ error: 'An error occurred while fetching users' });
  }
}

async function toggleUserSubscriptionStatus(req, res) {
  try {
    // Extract the ID from the URL parameters
    const { idUserSubscriptions } = req.params;

    // Validate the ID if needed
    if (!idUserSubscriptions) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    // Call the service to toggle the subscription status
    const updatedSubscription = await toggleSubscriptionStatusById(idUserSubscriptions);

    // Respond with the updated subscription
    return res.status(200).json(updatedSubscription);
  } catch (error) {
    console.error('Error toggling user subscription status:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function userCountController(req, res) {
  try {
    const { inactiveUserCount, activeUserCount, totalUserCount } = await getUserCounts();
    return res.json({ inactiveUserCount, activeUserCount, totalUserCount });
  } catch (error) {
    console.error('Error getting user counts:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function addGateToCity(req, res) {
  const stringFields = ['cameraIP', 'gateIP'];

  try {
    // Sanitize the incoming request body
    const sanitizedInput = sanitizeObject(req.body, stringFields);

    const { cityId, cameraIP, gateIP } = sanitizedInput;

    if (!cityId || !cameraIP || !gateIP) {
      return res.status(400).json({ message: 'City ID, Camera IP, and Gate IP are required' });
    }

    const newGate = await addGate(cityId, cameraIP, gateIP);

    res.status(200).json({
      message: `Gate added successfully to city ${cityId}`,
      gate: newGate
    });
  } catch (err) {
    console.error('Error adding gate:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getGatesByCityController(req, res) {
  const stringFields = ['idCities'];

  try {
    // Sanitize the incoming request params
    const sanitizedParams = sanitizeObject(req.params, stringFields);
    const { idCities: cityId } = sanitizedParams;

    if (!cityId) {
      return res.status(400).json({ message: 'City ID is required' });
    }

    const gates = await getGatesByCity(cityId);

    if (!gates || gates.length === 0) {
      return res.status(404).json({ message: `No gates found for city ID ${cityId}` });
    }

    res.status(200).json({
      message: `Gates retrieved successfully for city ${cityId}`,
      gates
    });
  } catch (err) {
    console.error('Error retrieving gates:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteGate(req, res) {
  try {
    const { idGates } = req.params;

    if (!idGates) {
      return res.status(400).json({ message: 'Gate ID is required' });
    }

    const result = await prisma.gates.delete({
      where: {
        idGates: parseInt(idGates, 10)
      }
    });

    return res.status(200).json({ message: `Gate deleted successfully for ID ${idGates}` });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: `No gate found for ID ${idGates}` });
    }

    // Handle other errors
    console.error('Error deleting gate:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function editGate(req, res) {
  const stringFields = ['CameraIP', 'GateIP']; // Fields to sanitize
  try {
    // Sanitize and validate input
    console.log('Request body before sanitization:', req.body); // Debugging input before sanitization
    const sanitizedInput = sanitizeObject(req.body, stringFields);
    console.log('Sanitized input:', sanitizedInput); // Debugging sanitized input

    const { idGates } = req.params;
    const { CameraIP, GateIP, Entrance, Fault } = sanitizedInput;

    // Ensure required fields are present
    if (!idGates || !CameraIP || !GateIP) {
      console.warn('Missing required fields:', { idGates, CameraIP, GateIP });
      return res.status(400).json({ message: 'Gate ID, Camera IP, and Gate IP are required' });
    }

    // Log what will be updated
    console.log('Updating gate with:', {
      idGates,
      CameraIP,
      GateIP,
      Entrance: Entrance !== undefined ? Boolean(Entrance) : false,
      Fault: Fault !== undefined ? Boolean(Fault) : false
    });

    // Update the gate in the database
    const updatedGate = await prisma.gates.update({
      where: { idGates: parseInt(idGates, 10) },
      data: {
        CameraIP,
        GateIP,
        Entrance: Entrance !== undefined ? Boolean(Entrance) : false,
        Fault: Fault !== undefined ? Boolean(Fault) : false
      }
    });

    console.log(`Gate with ID ${idGates} updated successfully`, updatedGate); // Debugging successful update
    return res.status(200).json({
      message: `Gate updated successfully with ID ${idGates}`,
      gate: updatedGate
    });
  } catch (error) {
    if (error.code === 'P2002') {
      // Prisma unique constraint violation error
      console.error('Unique constraint violation:', error.meta);
      return res.status(400).json({ message: `The ${error.meta.target} is already in use.` });
    }
    console.error('Error updating gate:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getParkingLotsFaultsController(req, res) {
  try {
    let result = null;
    const { cityId } = req.params;
    if (!cityId) {
      //get info from all parking lots
      result = await getParkingLotsFaultsModel();
    } else {
      result = await getParkingLotsFaultsModel(cityId);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error getting parking lots with faults:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getRecentSubscriptionsController(req, res) {
  try {
    const { limit } = req.query;
    const result = await getRecentSubscriptionsModel(limit);
    if (!result) {
      return res.status(404).json({ message: 'No recent subscriptions found' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error getting recent subscriptions:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function calculateAverageParkingTimeAllUsersController(req, res) {
  try {
    // Fetch the average parking time for all users
    const averageParkingTime = await calculateAverageParkingTimeAllUsers();

    // Return the average parking time
    if (averageParkingTime !== null) {
      res.status(200).json({ averageParkingTime });
    } else {
      res.status(404).json({ message: 'No parking history found for any user' });
    }
  } catch (err) {
    console.error('Error calculating average parking time for all users:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getRecentParkingLogsController(req, res) {
  try {
    // You can pass a limit parameter through query or set a default
    const limit = parseInt(req.query.limit) || 10;
    const logs = await getRecentParkingLogs(limit);
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function createNotification(req, res) {
  const { userId, message, isGlobal } = req.body;

  try {
    // Create the notification (global or user-specific)
    const newNotification = await prisma.notifications.create({
      data: {
        userId: isGlobal ? null : userId, // If global, userId is null
        message
      }
    });

    // If the notification is global, create entries for all users in UserNotifications
    if (isGlobal) {
      const allUsers = await prisma.users.findMany({ select: { idUsers: true } });
      const userNotifications = allUsers.map((user) => ({
        userId: user.idUsers, // Create for every user
        notificationId: newNotification.id // Notification ID from above
      }));

      // Insert into UserNotifications table for all users
      await prisma.userNotifications.createMany({
        data: userNotifications
      });

      // Emit the notification to all connected users
      const io = getIO();
      io.emit('new-notification', newNotification); // Broadcast to all users
    } else {
      // If it's user-specific, create an entry in UserNotifications for the target user
      await prisma.userNotifications.create({
        data: {
          userId: userId,
          notificationId: newNotification.id
        }
      });

      // Emit the notification only to the specific user via their socket room
      const io = getIO();
      io.to(`user-${userId}`).emit('new-notification', newNotification); // Emit to the specific user
    }

    // Return the created notification
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
}

module.exports = {
  addParkingLot,
  updateParkingLot,
  areasByCityID,
  addArea,
  removeArea,
  editArea,

  viewSlotsByCriteriaController,
  addSlotsToArea,
  deleteSlotByIDController,

  addSubscriptionController,
  updateSubscriptionController,
  removeSubscriptionController,
  removeParkingLot,
  avgParkingTimeForAll,
  mostActiveUsersController,
  incomeByTimeFrame,
  updateIndividualSlot,

  viewUsersByCriteria,
  toggleUserSubscriptionStatus,
  updateCityPicture,
  userCountController,
  getParkingLotsFaultsController,
  getRecentSubscriptionsController,
  calculateAverageParkingTimeAllUsersController,
  getRecentParkingLogsController,
  addIndividualSlot,
  addGateToCity,
  getGatesByCityController,
  deleteGate,
  editGate,
  createNotification
};
