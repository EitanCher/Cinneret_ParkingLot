const pool = require('../db-postgres/db_config');
const prisma = require('../prisma/prismaClient');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const { hashPassword } = require('../utils/passwordUtils');
const { convertToISODate } = require('../utils/dateUtils');
const { updateUserSchema, addUserControllerSchema, carSchema } = require('../db-postgres/zodSchema');
const { promise } = require('zod');
const saltRounds = 10;

//------------------------------------------------------------------------------//

async function getUserById(userId) {
  try {
    const user = await prisma.users.findUnique({
      where: { idUsers: userId } // Ensure 'idUsers' matches the primary key field name
    });
    if (user) return user;
    throw new Error('User not found');
  } catch (err) {
    console.error('Error fetching user by ID:', err.message); // Use 'err' consistently
    throw err; // Also use 'err' here
  }
}

async function deleteUserById(userId) {
  try {
    // Ensure id is an integer
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) throw new Error('Invalid user ID');

    // Use a transaction to ensure all operations succeed or none
    await prisma.$transaction(async (prisma) => {
      // Delete associated records in `cars`
      await prisma.cars.deleteMany({
        where: { OwnerID: userIdInt }
      });

      // Delete the associated subscription record

      // Find the user's subscription
      const userSubscription = await prisma.userSubscriptions.findFirst({
        where: { UserID: userIdInt }
      });

      if (userSubscription) {
        // Delete the associated subscription record
        await prisma.userSubscriptions.delete({
          where: { idUserSubscriptions: userSubscription.idUserSubscriptions }
        });
      }

      // Delete the user
      await prisma.users.delete({
        where: { idUsers: userIdInt }
      });
    });

    console.log('User and associated records deleted successfully');
    return {
      success: true,
      message: 'User and associated records deleted successfully'
    };
  } catch (err) {
    if (err.code === 'P2025') {
      // Prisma error code for record not found
      return { success: false, message: 'User not found' };
    } else {
      console.error('Error deleting user:', err.message);
      return { success: false, message: err.message };
    }
  }
}

async function updateUserById(userId, updates) {
  try {
    // Validate `userId` if needed
    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    const validatedUpdates = updateUserSchema.parse(updates);
    const user = await prisma.users.update({
      where: { idUsers: userId }, // Ensure 'idUsers' matches the primary key field name
      data: validatedUpdates // `updates` should be an object with fields to update
    });

    console.log('User updated successfully');
    return { success: true, message: 'User updated successfully', user };
  } catch (err) {
    if (err.code === 'P2025') {
      // Prisma error code for record not found
      return { success: false, message: 'User not found' };
    } else {
      console.error('Error updating user:', err.message);
      return { success: false, message: err.message };
    }
  }
}
async function getSubscriptions() {
  try {
    const result = await prisma.subscriptionPlans.findMany();
    return result;
  } catch (err) {
    console.log('error getting subscriptions', err.message);
    throw err;
  }
}

async function createUser(userData) {
  try {
    // Validate userData with the Zod schema
    const validatedData = addUserControllerSchema.parse(userData);

    // Proceed with hashing password and creating the user in the database
    const { Password, ...restOfUserData } = validatedData;
    const hashedPassword = await hashPassword(Password);

    return await prisma.users.create({
      data: {
        ...restOfUserData,
        Password: hashedPassword
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      // Handle validation errors
      console.error('Validation error:', error.errors);
      throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`);
    } else {
      // Handle other errors
      console.error('Error creating user:', error.message);
      throw error;
    }
  }
}

async function getNumCarsByUserId(userId) {
  try {
    const result = await prisma.cars.count({
      where: { OwnerID: userId }
    });
    return result;
  } catch (err) {
    console.log('Error getting number of cars by user ID:', err.message);
    throw err;
  }
}

async function createCars(userId, carData, subscriptionPlanID) {
  console.log('car data:', carData);
  // Validate car count based on subscription plan
  console.log('fetching max car per subscription ');
  const maxCarsObj = await prisma.subscriptionPlans.findFirst({
    where: { idSubscriptionPlans: subscriptionPlanID },
    select: { MaxCars: true }
  });

  if (!maxCarsObj) throw new Error("Couldn't fetch subscription max cars count");

  const maxCars = maxCarsObj.MaxCars;
  const numCarsUserHas = await getNumCarsByUserId(userId);

  console.log('sub plan max cars: ' + maxCars);
  console.log('user has ' + numCarsUserHas + 'cars');

  if (numCarsUserHas >= maxCars) throw new Error(` this subscription already has the maximum car count for this plan: ${numCarsUserHas}`);

  try {
    const result = await prisma.cars.create({
      data: {
        RegistrationID: carData.RegistrationID,
        Model: carData.Model,
        OwnerID: userId
      }
    });

    console.log('Car added successfully: ', result);

    return {
      message: 'Car added successfully.',
      car: result
    };
  } catch (error) {
    if (error.code === 'P2002' && error.meta && error.meta.target.includes('RegistrationID')) {
      throw new Error(`The car with Registration ID ${carData.RegistrationID} already exists.`);
    }
    console.error('Error adding car:', error.message);
    throw error;
  }
}

const findUserByEmail = async (email) => {
  try {
    return await prisma.users.findUnique({
      where: { Email: email },
      select: {
        idUsers: true,
        Email: true,
        Role: true // Explicitly select the role field
        // Add other fields you may need
      }
    });
  } catch (err) {
    console.error('Error finding user by email:', err.message);
    throw err;
  }
};

async function updateCarModel(userID, idCars, carData) {
  try {
    console.log('Start of try block in updateCarModel');

    // Use `carSchema` to validate a single car
    const validatedCar = carSchema.parse({ idCars, ...carData });
    console.log('Validated car:', validatedCar);

    const carInDB = await prisma.cars.findFirst({
      where: { idCars: parseInt(idCars, 10), OwnerID: userID }
    });

    if (!carInDB) {
      console.log(`Car with idCars ${idCars} not found in DB for user ${userID}.`);
      throw new Error(`Car with ID ${idCars} not found.`);
    }

    // Update the car in the database
    console.log(`Updating car with idCars ${idCars}`);
    const updatedCar = await prisma.cars.update({
      where: { idCars: parseInt(idCars, 10) },
      data: {
        RegistrationID: validatedCar.RegistrationID,
        Model: validatedCar.Model
      }
    });

    console.log(`Successfully updated car with idCars ${idCars}`);
    return {
      message: 'Car updated successfully.',
      car: updatedCar
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`);
    }
    console.error('Error updating car:', error.message);
    throw error;
  }
}

module.exports = {
  deleteUserById,
  getUserById,
  updateUserById,
  getSubscriptions,
  createUser,
  createCars,
  updateCarModel,
  findUserByEmail
};
