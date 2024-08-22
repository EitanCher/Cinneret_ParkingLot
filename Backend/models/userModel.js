const pool = require('../db-postgres/db_config');
const prisma = require('../prisma/prismaClient');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const { hashPassword } = require('../utils/passwordUtils');
const { convertToISODate } = require('../utils/dateUtils');
const { updateUserSchema, addUserControllerSchema, carSchema, carsArraySchema } = require('../db-postgres/zodSchema');
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

async function createCars(userId, carsData, subscriptionPlanID) {
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
  if (carsData.length > maxCars) throw new Error(`This subscription plan only supports up to ${maxCars} cars`);
  if (numCarsUserHas >= maxCars)
    throw new Error(` this subscription already has the maximum car count for this plan: ${numCarsUserHas}`);
  if (carsData.length === 0) throw new Error('No cars data provided');

  // Add cars to the database
  try {
    const result = await prisma.cars.createMany({
      data: carsData.map((car) => ({
        RegistrationID: car.RegistrationID,
        Model: car.Model,
        OwnerID: userId
      })),
      skipDuplicates: true // Skip duplicates if any
    });

    // Log the successful insertion
    console.log(`Successfully inserted ${result.count} cars.`);

    // Return relevant information
    return {
      message: 'Cars added successfully.',
      count: result.count // Number of cars inserted
    };
  } catch (error) {
    console.error('Error adding cars:', error.message);
    throw error; // Re-throw the error to be handled by the calling function
  }
}

async function updateCarsModel(userID, carsData) {
  try {
    console.log('Start of try block in updateCarsModel');

    // Validate and sanitize input data
    const validatedCars = carsArraySchema.parse(carsData);
    console.log('Validated cars:', validatedCars);

    // Fetch existing cars from the database
    const carsInDB = await prisma.cars.findMany({
      where: { OwnerID: userID }
    });
    console.log('Cars in DB:', carsInDB);

    // Map existing cars for quick lookup
    const carsInDBMap = new Map(carsInDB.map((car) => [car.idCars, car]));

    // Determine which cars need to be updated
    const carsToUpdate = validatedCars
      .map((car) => {
        const existingCar = carsInDBMap.get(car.idCars);

        if (!existingCar) {
          console.log(`Car with idCars ${car.idCars} not found in DB.`);
          return null;
        }

        // Always update the car
        console.log(`Car with idCars ${car.idCars} will be updated.`);
        return {
          idCars: car.idCars,
          data: {
            RegistrationID: car.RegistrationID,
            Model: car.Model
          }
        };
      })
      .filter(Boolean); // Remove null values

    if (carsToUpdate.length === 0) {
      console.log('No cars to update.');
      return { success: true, message: 'No cars to update.' };
    }

    // Update cars in the database
    await Promise.all(
      carsToUpdate.map((carUpdate) => {
        console.log(`Updating car with idCars ${carUpdate.idCars}`);
        return prisma.cars.update({
          where: { idCars: carUpdate.idCars },
          data: carUpdate.data
        });
      })
    );

    console.log(`Successfully updated ${carsToUpdate.length} cars.`);
    return {
      message: 'Cars updated successfully.',
      count: carsToUpdate.length // Number of cars updated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`);
    }
    console.error('Error updating cars:', error.message);
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
  updateCarsModel
};
