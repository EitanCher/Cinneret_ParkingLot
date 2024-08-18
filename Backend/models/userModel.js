const queries = require("../queries/queries");
const pool = require("../db-postgres/db_config");
const prisma = require("../prisma/prismaClient");
const bcrypt = require("bcrypt");
const { hashPassword } = require("../utils/passwordUtils");
const { convertToISODate } = require("../utils/dateUtils");
const { validateCarCount } = require("../utils/validationUtils");
const saltRounds = 10;

//------------------------------------------------------------------------------//

async function getUserById(userId) {
  try {
    const user = await prisma.users.findUnique({
      where: { idUsers: userId }, // Ensure 'idUsers' matches the primary key field name
    });
    if (user) return user;
    throw new Error("User not found");
  } catch (err) {
    console.error("Error fetching user by ID:", err.message); // Use 'err' consistently
    throw err; // Also use 'err' here
  }
}

async function deleteUserById(userId) {
  try {
    // Ensure id is an integer
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) throw new Error("Invalid user ID");

    // Use a transaction to ensure all operations succeed or none
    await prisma.$transaction(async (prisma) => {
      // Delete associated records in `cars`
      await prisma.cars.deleteMany({
        where: { OwnerID: userIdInt },
      });

      // Delete the associated subscription record

      // Find the user's subscription
      const userSubscription = await prisma.userSubscriptions.findFirst({
        where: { UserID: userIdInt },
      });

      if (userSubscription) {
        // Delete the associated subscription record
        await prisma.userSubscriptions.delete({
          where: { idUserSubscriptions: userSubscription.idUserSubscriptions },
        });
      }

      // Delete the user
      await prisma.users.delete({
        where: { idUsers: userIdInt },
      });
    });

    console.log("User and associated records deleted successfully");
    return {
      success: true,
      message: "User and associated records deleted successfully",
    };
  } catch (err) {
    if (err.code === "P2025") {
      // Prisma error code for record not found
      return { success: false, message: "User not found" };
    } else {
      console.error("Error deleting user:", err.message);
      return { success: false, message: err.message };
    }
  }
}

async function updateUserById(userId, updates) {
  try {
    const user = await prisma.users.update({
      where: { idUsers: userId }, // Ensure 'idUsers' matches the primary key field name
      data: updates, // `updates` should be an object with fields to update
    });
    console.log("User updated successfully");
    return { success: true, message: "User updated successfully", user };
  } catch (err) {
    if (err.code === "P2025") {
      // Prisma error code for record not found
      return { success: false, message: "User not found" };
    } else {
      console.error("Error updating user:", err.message);
      return { success: false, message: err.message };
    }
  }
}

async function getSubscriptions() {
  try {
    const result = await prisma.subscriptionPlans.findMany();
    return result;
  } catch (err) {
    console.log("error getting subscriptions", err.message);
    throw err;
  }
}

async function createUser(userData, subscriptionData, carsData) {
  const { persId, FirstName, LastName, Email, Phone, Password } = userData;
  const { StartDate, EndDate } = subscriptionData;

  if (!Password) throw new Error("Password is required");

  try {
    return await prisma.$transaction(async (prisma) => {
      // Create user
      const hashedPassword = await hashPassword(Password);
      const user = await prisma.users.create({
        data: {
          ...userData,
          Password: hashedPassword,
          persId: parseInt(persId, 10),
        },
      });

      // Create subscription
      const subscription = await prisma.userSubscriptions.create({
        data: {
          UserID: user.idUsers,
          SubscriptionPlanID: subscriptionData.SubscriptionPlanID,
          StartDate: convertToISODate(StartDate),
          EndDate: convertToISODate(EndDate),
          Status: "Active",
        },
      });

      // Validate and create cars
      await validateCarCount(carsData, subscription.SubscriptionPlanID);
      await prisma.cars.createMany({
        data: carsData.map((car) => ({
          RegistrationID: car.RegistrationID,
          Model: car.Model,
          OwnerID: user.idUsers,
        })),
      });

      return user;
    });
  } catch (error) {
    console.error("Error creating user and related records:", error.message);
    throw error;
  }
}
async function createUserSubscription(
  client,
  UserID,
  SubscriptionPlanID,
  StartDate,
  EndDate,
  Status
) {
  try {
    const result = await client.query(queries.createUserSubscription, [
      UserID,
      SubscriptionPlanID,
      StartDate,
      EndDate,
      Status,
    ]);
    return result.rows[0];
  } catch (e) {
    console.error("Error creating user subscription:", e.message);
    throw e;
  }
}

async function createCar(client, RegistrationID, Model, OwnerID) {
  try {
    const result = await client.query(queries.createCar, [
      RegistrationID,
      Model,
      OwnerID,
    ]);
    return result.rows[0].idCars;
  } catch (e) {
    console.error("Error creating car:", error);
    throw error;
  }
}

async function createMultipleCars(client, carsData, OwnerID) {
  return Promise.all(
    carsData.map((car) =>
      createCar(client, car.RegistrationID, car.Model, OwnerID)
    )
  );
}

module.exports = {
  deleteUserById,
  getUserById,
  updateUserById,
  getSubscriptions,
  createUser,
  createUserSubscription,
  createCar,
  createMultipleCars,
};
