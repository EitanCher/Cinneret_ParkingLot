const xss = require('xss');
const {
  deleteUserById,
  updateUserById,
  getSubscriptions,
  createUser
} = require('../models/userModel');
const {
  sanitizeAndValidateData,
  handleZodErrorResponse,
  logAndRespondWithError
} = require('../utils/validationUtils');
const { z } = require('zod'); // Import Zod for validation
const { updateUserSchema } = require('../db-postgres/zodSchema');

const { sanitizeObject } = require('../utils/xssUtils');
const prisma = require('../prisma/prismaClient');
const jwt = require('jsonwebtoken');
const passport = require('../utils/passport-config'); // Import from the correct path

const bcrypt = require('bcrypt');
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
