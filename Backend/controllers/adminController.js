const xss = require('xss');
const { deleteUserById, updateUserById, getSubscriptions, createUser } = require('../models/userModel');
const { getUsersWithActiveSubscriptions } = require('../models/adminModel');
const { getAreaIdsByCityId } = require('../models/parkingModel');
const { z } = require('zod'); // Import Zod for validation
const {
  updateUserSchema,
  CityCreateSchema,
  CityUpdateSchema,
  AreaCreateSchema,
  AreaUpdateSchema
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
    const sanitizedData = sanitizeObject(req.body, ['CityName', 'FullAddress']);

    const { CityName, FullAddress } = sanitizedData; // Extract parameters from sanitized data

    // Validate input with schema
    CityUpdateSchema.parse({ CityName, FullAddress });

    // Update the city record in the database
    const updatedCity = await prisma.cities.update({
      where: { id: idCities }, // Assuming 'id' is the primary key field in the 'cities' table
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
//NEEDS TESTING
async function areaIdsByCityID(req, res) {
  try {
    const { idCities } = req.params;
    const areaIds = await prisma.areas.findMany({
      where: { CityID: idCities },
      select: { idAreas: true }
    });

    if (!areaIds) {
      return res.status(404).json({ message: 'City not found' });
    }

    // Return the area IDs associated with the city
    return res.status(200).json({ areaIds: areaIds.map((area) => area.idAreas) });
  } catch (err) {}
}
//NEEDS TESTING

async function addArea(req, res) {
  try {
    const sanitizedData = sanitizeObject(req.body, ['CityID', 'AreaName']);
    const { idCities, AreaName } = sanitizedData;
    AreaCreateSchema.parse(idCities, AreaName);
    const area = await prisma.areas.create({
      data: { CityID: idCities, AreaName }
    });
    if (!area) {
      return res.status(500).json({ message: 'Failed to add area' });
    }
    return res.status(201).json({ idAreas: area.idAreas, AreaName });
  } catch (err) {
    console.error('Error adding area:', err);
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
async function addSlotsToArea(req, res) {
  try {
    const { idAreas, numOfSlots } = req.body;

    // Call the model function to add slots
    const result = await addSlots(idAreas, numOfSlots);

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
async function deactivateSlot(req, res) {
  try {
    // Extract the slot ID from the request parameters
    const { idSlots } = req.params;
    // Perform the deletion in the database
    const slot = await prisma.slots.update({
      where: { idSlots: Number(idSlots) }, // Ensure idSlots is a number if your schema uses integer IDs
      data: { isActive: false }
    });

    // Check if the deletion was successful and return appropriate response
    if (slot) {
      return res.status(200).json({ message: 'Slot successfully deactivated' });
    } else {
      return res.status(404).json({ message: 'Slot not found' });
    }
  } catch (err) {
    console.error('Error deactivating slot:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

//NEEDS TESTING

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

//get users with active subs

module.exports = {
  addParkingLot,
  updateParkingLot,
  areaIdsByCityID,
  addArea,
  removeArea,
  deleteSlotsByIdRangeController,
  deactivateSlot,
  addSlotsToArea
};
