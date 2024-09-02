const xss = require('xss');
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
  viewSlotsByStatusAreaCity,
  updateSlotByID,
  deleteSlotsByCriteria,
  updateSlotsByCriteria,
  deleteSlotByID,
  getUsersByCriteria,
  toggleSubscriptionStatusById
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

async function addParkingLot(req, res) {
  try {
    const sanitizedData = sanitizeObject(req.body, ['CityName', 'FullAddress']);
    const { CityName, FullAddress } = sanitizedData;

    // Validate input with schema
    CityCreateSchema.parse({ CityName, FullAddress });

    // Create the city record in the database
    const city = await prisma.cities.create({
      data: { CityName, FullAddress }
    });

    if (!city) {
      return res.status(500).json({ message: 'Failed to add city' });
    }

    // Return the created city details
    return res.status(201).json({
      CityName: city.CityName,
      FullAddress: city.FullAddress
    });
  } catch (error) {
    console.error('Error adding city:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
//NEEDS TESTING
async function updateParkingLot(req, res) {
  try {
    // Sanitize input
    const idCities = parseInt(req.params.idCities, 10); // Ensure this matches the route parameter name
    console.log('idCities in controller:', idCities);

    const sanitizedData = sanitizeObject(req.body, ['CityName', 'FullAddress']);
    console.log('sanitized data:' + JSON.stringify(sanitizedData));
    const { CityName, FullAddress } = sanitizedData; // Extract parameters from sanitized data

    // Validate input with schema
    CityUpdateSchema.parse({ CityName, FullAddress });

    // Update the city record in the database
    const updatedCity = await prisma.cities.update({
      where: { idCities: idCities }, // Use the parsed integer here
      data: { CityName, FullAddress }
    });

    if (!updatedCity) {
      return res.status(404).json({ message: 'City not found' });
    }

    // Return the updated city details
    return res.status(200).json({
      idCities: updatedCity.id,
      CityName: updatedCity.CityName,
      FullAddress: updatedCity.FullAddress
    });
  } catch (error) {
    console.error('Error updating city:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function removeParkingLot(req, res) {
  try {
    const idCities = parseInt(req.params.idCities, 10); // Directly parse the parameter
    console.log('idCities:', idCities);

    if (isNaN(idCities)) {
      return res.status(400).json({ message: 'Invalid city ID' });
    }

    // Remove dependent records in the Areas table
    await prisma.areas.deleteMany({
      where: { CityID: idCities }
    });

    // Now, delete the city record
    const deletedCity = await prisma.cities.delete({
      where: { idCities: idCities } // Use the correct field name
    });

    if (!deletedCity) {
      return res.status(404).json({ message: 'City not found' });
    }

    return res.status(200).json({ message: `City '${deletedCity.CityName}' has been deleted` });
  } catch (err) {
    console.error('Error removing city:', err.message); // Log the error message
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

//NEEDS TESTING
async function areasByCityID(req, res) {
  try {
    const { idCities } = req.params;
    const areas = await prisma.areas.findMany({
      where: { CityID: idCities },
      select: { idAreas: true, AreaName: true }
    });

    if (areas.length === 0) {
      return res.status(404).json({ message: 'City not found' });
    }

    // Return the area IDs and names associated with the city
    return res.status(200).json({
      areas: areas.map((area) => ({
        idAreas: area.idAreas,
        AreaName: area.AreaName
      }))
    });
  } catch (err) {
    // Handle the error
    // Handle the error
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while retrieving areas.' });
  }
}

//NEEDS TESTING

async function addArea(req, res) {
  try {
    // Sanitize and extract required data
    const sanitizedData = sanitizeObject(req.body, ['CityID', 'AreaName']);
    const { CityID, AreaName } = sanitizedData; // Corrected to use CityID

    // Parse using Zod, make sure AreaCreateSchema expects an object
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
    if (err.name === 'ZodError') {
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
async function toggleSlot(req, res) {
  try {
    // Extract the slot ID from the request parameters
    const { idSlots } = req.params;

    // Retrieve the current status of the slot
    const slot = await prisma.slots.findUnique({
      where: { idSlots: Number(idSlots) }
    });

    // Check if the slot exists
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // Toggle the isActive status
    const updatedSlot = await prisma.slots.update({
      where: { idSlots: Number(idSlots) },
      data: { Active: !slot.Active }
    });

    return res.status(200).json({ message: `Slot ${updatedSlot.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    console.error('Error toggling slot:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

//SUBSCRIPTIONS
//NEEDS TESTING  || ALREADY REFACTORED WITH A MODEL
async function addSubscriptionController(req, res) {
  try {
    const sanitizedData = sanitizeObject(req.body, ['Name', 'Features']);
    const { Price, MaxCars, MaxActiveReservations } = req.body;
    const { Name, Features } = sanitizedData;
    const Data = {
      Name,
      Price,
      MaxCars,
      MaxActiveReservations,
      Features
    };
    const subscription = await addSubscription(Data);

    // Return the created subscription details
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
    return res.status(400).json({ message: 'Invalid data', errors: err.message });
  }
}

async function updateSubscriptionController(req, res) {
  try {
    const idSubscriptionPlans = req.params.idSubscriptionPlans;
    const sanitizedData = sanitizeObject(req.body, ['Name', 'Features']);
    const { Name, Features } = sanitizedData;
    const { Price, MaxCars, MaxActiveReservations } = req.body;
    const data = { Name, Features, Price, MaxCars, MaxActiveReservations };
    const result = await updateSubscriptionPlanByID(idSubscriptionPlans, data);
    if (!result) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function removeSubscriptionController(req, res) {
  try {
    const idSubscriptionPlans = req.params.idSubscriptionPlans;
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
    // Extract startDate and endDate from query parameters or request body
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required.' });
    }

    // Call the service function to calculate the income
    const incomeData = await calculateIncomeByTimeFrame(startDate, endDate);

    // Return the result as a JSON response
    res.status(200).json(incomeData);
  } catch (error) {
    console.error('Error in incomeByTimeFrameController:', error.message);
    res.status(500).json({ error: 'An error occurred while calculating income.' });
  }
}

//NEEDS TESTING
async function mostActiveUsersController(req, res) {
  try {
    const result = await calculateMostActiveUsers(numUsers); //recieves  OwnerID: 2,FirstName: 'Jane',LastName: 'Smith',Email: 'jane.smith@example.com',logCount: 120
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating most active users:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// NEEDS TESTING
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
//NEEDS TESTING
const deleteSlotsByIdRangeController = async (req, res) => {
  console.log('Received DELETE request for /api/slots/range');
  console.log('Request Body:', req.body); // Log request body

  const { startId, endId } = req.body;

  try {
    // Validate input
    rangeSchema.parse({ startId, endId });

    // Perform the deletion
    const result = await prisma.slots.deleteMany({
      where: {
        idSlots: {
          gte: startId,
          lte: endId
        }
      }
    });

    res.status(200).json({
      message: `Slots deleted successfully`,
      count: result.count
    });
  } catch (err) {
    console.error('Error deleting slots:', err.message);
    res.status(400).json({ message: err.errors ? err.errors : 'Invalid input' });
  }
};
//NEEDS TESTING
// TODO view slots- add criteria (busy)
async function slotsByStatusAreaCity(req, res) {
  try {
    const { active, cityId, areaId } = req.query;
    if (!active && !cityId && !areaId) {
      return res.status(400).json({ error: 'At least one filter parameter is required.' });
    }

    const result = await viewSlotsByStatusAreaCity(active, cityId, areaId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error viewing slots:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
//NEEDS TESTING
async function updateIndividualSlot(req, res) {
  try {
    const { idSlots } = req.params;
    const { BorderRight, Active } = req.body;
    const result = await updateSlotByID(idSlots, { BorderRight, Active });

    if (result.message) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
//NEEDS TESTING
async function updateSlotsByCriteriaController(req, res) {
  try {
    const { cityId, areaId, active } = req.query;
    const { borderRight, activeStatus } = req.body;

    // Call the model function to update slots
    const result = await updateSlotsByCriteria({
      cityId: Number(cityId), // Ensure query parameters are converted to numbers
      areaId: areaId ? Number(areaId) : undefined,
      active: active ? JSON.parse(active) : undefined,
      updates: {
        BorderRight: borderRight,
        Active: activeStatus
      }
    });

    if (result.count === 0) {
      // `updateMany` returns an object with `count` of updated records
      return res.status(404).json({ message: 'No slots found matching the criteria' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating slots:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

//NEEDS TESTING
async function deleteSlotsByStatusAreaCity(req, res) {
  try {
    const { cityId } = req.params;
    const { areaId, active } = req.query;
    if (!cityId) {
      return res.status(400).json({ error: 'City is required' });
    }
    const criteria = {
      cityId: parseInt(cityId, 10),
      areaId: areaId ? parseInt(areaId, 10) : undefined,
      active: active !== undefined ? active === 'true' : undefined
    };
    const result = await deleteSlotsByCriteria(criteria);
    if (result.count === 0) {
      return res.status(404).json({ message: 'No slots found to delete' });
    }

    return res.status(200).json({ message: `Deleted ${result.count} slots successfully` });
  } catch (error) {
    console.error('Error deleting slots:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
// NEEDS TESTING
async function deleteSlotByIDController(req, res) {
  try {
    const { idSlots } = req.params;
    const result = await deleteSlotByID(idSlots);

    if (!result) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    return res.status(200).json(result);
  } catch (error) {}
}

//NEEDS TESTING
async function viewUsersByCriteria(req, res) {
  try {
    const { subscriptionStatus, SubscriptionPlanName, FirstName, LastName, Phone, Email, Violations } = req.query;
    const criteria = {
      ...(validatedParams.subscriptionStatus && { subscriptionStatus: validatedParams.subscriptionStatus }),
      ...(validatedParams.SubscriptionPlanName && { SubscriptionPlanName: validatedParams.SubscriptionPlanName }),
      ...(validatedParams.FirstName && { FirstName: validatedParams.FirstName }),
      ...(validatedParams.LastName && { LastName: validatedParams.LastName }),
      ...(validatedParams.Phone && { Phone: validatedParams.Phone }),
      ...(validatedParams.Email && { Email: validatedParams.Email }),
      ...(validatedParams.Violations !== undefined && { Violations: validatedParams.Violations })
    };

    // Ensure that at least one criteria is present
    if (Object.keys(criteria).length === 0) {
      return res.status(400).json({ error: 'At least one criteria must be provided' });
    }
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found matching the criteria' });
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
async function createGate(req, res) {}

//deal with parking violations web socket
//make slot inactive when fault is detected

module.exports = {
  addParkingLot,
  updateParkingLot,
  areasByCityID,
  addArea,
  removeArea,
  deleteSlotsByIdRangeController,
  toggleSlot,
  addSlotsToArea,
  addSubscriptionController,
  updateSubscriptionController,
  removeSubscriptionController,
  removeParkingLot,
  avgParkingTimeForAll,
  mostActiveUsersController,
  incomeByTimeFrame,
  slotsByStatusAreaCity,
  updateIndividualSlot,
  updateSlotsByCriteriaController,
  deleteSlotsByStatusAreaCity,
  deleteSlotByIDController,
  viewUsersByCriteria,
  toggleUserSubscriptionStatus
};
