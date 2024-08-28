const pool = require('../db-postgres/db_config');
const prisma = require('../prisma/prismaClient');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const { hashPassword } = require('../utils/passwordUtils');
const { convertToISODate } = require('../utils/dateUtils');
const { updateUserSchema, addUserControllerSchema, carsArraySchem, rangeSchema } = require('../db-postgres/zodSchema');
const { promise } = require('zod');
const saltRounds = 10;
const idSchema = z.number().int().positive();

async function getUsersWithActiveSubscriptions() {
  try {
    const users = await prisma.users.findMany({
      where: {
        UserSubscriptions: {
          some: {
            Status: 'active', // Assuming 'active' is the status for active subscriptions
            EndDate: {
              gte: new Date() // Ensure subscription end date is in the future or is ongoing
            }
          }
        }
      },
      include: {
        UserSubscriptions: {
          where: {
            Status: 'active',
            EndDate: {
              gte: new Date()
            }
          },
          include: {
            SubscriptionPlans: true // Include subscription plan details if needed
          }
        }
      }
    });
    return users;
  } catch (error) {
    console.error('Error fetching users with active subscriptions:', error.message);
    throw error;
  }
}

//NEEDS TESTING
async function addSlots(idAreas, numOfSlots) {
  try {
    idSchema.parse(idAreas);
    idSchema.parse(numOfSlots);
    // Prepare new slots data
    const newSlots = Array.from({ length: numOfSlots }).map(() => ({
      AreaID: idAreas,
      Busy: false, //HAS DEFAULT VALUES ANYWAY SO CAN DROP
      Active: true, //HAS DEFAULT VALUES ANYWAY SO CAN DROP
      Fault: false, //HAS DEFAULT VALUES ANYWAY SO CAN DROP
      BorderRight: Math.floor(Math.random() * 100) /// NEED TO DECIDE WHAT TO DO WITH THIS
    }));

    const result = await prisma.slots.createMany({
      data: newSlots
    });
    if (!result.count) {
      throw new Error('Failed to insert slots into the database.');
    }
    return result;
  } catch (err) {
    console.error('Error inserting slots:', err.message);
    throw new Error(`Error adding slots: ${err.message}`);
  }
}
module.exports = {
  getUsersWithActiveSubscriptions,
  addSlots
};
