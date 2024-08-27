const pool = require('../db-postgres/db_config');
const prisma = require('../prisma/prismaClient');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const { hashPassword } = require('../utils/passwordUtils');
const { convertToISODate } = require('../utils/dateUtils');
const { updateUserSchema, addUserControllerSchema, carsArraySchema } = require('../db-postgres/zodSchema');
const { promise } = require('zod');
const saltRounds = 10;

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

module.exports = {
  getUsersWithActiveSubscriptions
};
