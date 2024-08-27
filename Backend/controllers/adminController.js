const xss = require('xss');
const { deleteUserById, updateUserById, getSubscriptions, createUser } = require('../models/userModel');
const { getUsersWithActiveSubscriptions } = require('../models/adminModel');
const { getAreaIdsByCityId } = require('../models/parkingModel');
const { z } = require('zod'); // Import Zod for validation
const { updateUserSchema, CityCreateSchema, CityUpdateSchema } = require('../db-postgres/zodSchema');
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

module.exports = {
  addParkingLot,
  updateParkingLot,
  areaIdsByCityID
};
