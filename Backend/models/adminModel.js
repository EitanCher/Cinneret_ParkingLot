const pool = require('../db-postgres/db_config');
const prisma = require('../prisma/prismaClient');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { fetchAverageParkingTimeByUser } = require('../models/parkingModel');
const { hashPassword } = require('../utils/passwordUtils');
const { convertToISODate } = require('../utils/dateUtils');
const {
  updateUserSchema,
  addUserControllerSchema,
  carsArraySchem,
  rangeSchema,
  updateSubscriptionPlanSchema,
  userSubscriptionDateSchema,
  viewSlotsSchema,
  updateSlotSchema,
  updateCriteriaSchema,
  deleteSlotsCriteriaSchema,
  UserCriteriaSchema,
  IdSchema
} = require('../db-postgres/zodSchema');
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
async function addSlotsBulk(idAreas, numOfSlots) {
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

async function addSubscription(data) {
  try {
    createSubscriptionPlanSchema.parse({
      data
    });
    const subscription = await prisma.subscriptionPlans.create({
      data
    });
    return subscription;
  } catch (err) {
    throw new Error(`Failed to add subscription: ${err.message}`);
  }
}

async function getSubscriptionPlanByID(idSubscriptionPlans) {
  try {
    const existingSubscription = await prisma.subscriptionPlans.findUnique({
      where: { idSubscriptionPlans: Number(idSubscriptionPlans) }
    });
    if (!existingSubscription) {
      throw new Error('Subscription Plan not found');
    }
    return existingSubscription;
  } catch (err) {
    console.error('Error fetching subscription plan:', err.message);
    throw err;
  }
}

async function updateSubscriptionPlanByID(idSubscriptionPlans, data) {
  try {
    updateSubscriptionPlanSchema.parse(data);
    const existingSubscriptionPlan = await getSubscriptionPlanByID(idSubscriptionPlans);
    if (!existingSubscriptionPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    let shouldUpdateFeatures = false;
    if (data.Features && Array.isArray(data.Features)) {
      shouldUpdateFeatures = JSON.stringify(existingSubscriptionPlan.Features) !== JSON.stringify(data.Features);
    }

    const updatedData = {
      Name: existingSubscriptionPlan.Name !== data.Name && data.Name ? data.Name : existingSubscriptionPlan.Name,
      Price: existingSubscriptionPlan.Price !== data.Price && data.Price ? data.Price : existingSubscriptionPlan.Price,
      Duration: existingSubscriptionPlan.Duration !== data.Duration && data.Duration ? data.Duration : existingSubscriptionPlan.Duration,
      MaxSlots: existingSubscriptionPlan.MaxSlots !== data.MaxSlots && data.MaxSlots ? data.MaxSlots : existingSubscriptionPlan.MaxSlots,
      Features: shouldUpdateFeatures && data.Features ? data.Features : existingSubscriptionPlan.Features
    };

    const updatedSubscription = await prisma.subscriptionPlans.update({
      where: { idSubscriptionPlans: idSubscriptionPlans },
      data: updatedData
    });

    if (!updatedSubscription) {
      throw new Error('Failed to update subscription plan');
    }
    return updatedSubscription;
  } catch (err) {
    console.error('Error updating subscription plan:', err.message);
    throw new Error(`Failed to update subscription plan: ${err.message}`);
  }
}

async function deleteSubscriptionPlanByID(idSubscriptionPlans) {
  try {
    const existingSubscription = await getSubscriptionPlanByID(idSubscriptionPlans);
    if (!existingSubscription) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    const deletedSubscription = await prisma.subscriptionPlans.delete({
      where: { idSubscriptionPlans: idSubscriptionPlans }
    });
    if (!deletedSubscription) {
      throw new Error('Failed to delete subscription plan');
    }
    return deletedSubscription;
  } catch (err) {
    console.error('Error deleting subscription plan:', err.message);
    throw new Error(`Failed to delete subscription plan: ${err.message}`);
  }
}

async function calculateAvgParkingTimeForAll() {
  try {
    // Fetch all users and their total parking times in one query
    const allUsers = await prisma.users.findMany({
      select: { idUsers: true }
    });

    // If there are no users, return null or handle as needed
    if (allUsers.length === 0) {
      return 0; // or return null depending on how you want to handle it
    }

    // Use Promise.all to fetch parking times in parallel
    const parkingTimes = await Promise.all(allUsers.map((user) => fetchAverageParkingTimeByUser(user.idUsers)));

    // Calculate the average parking time
    const totalAVG = parkingTimes.reduce((sum, time) => sum + time, 0);
    const avgForAll = totalAVG / parkingTimes.length;

    return avgForAll;
  } catch (err) {
    console.error('Error calculating average parking time:', err.message);
    throw err;
  }
}

async function calculateMostActiveUsers(numOfUsers) {
  try {
    // Validate numOfUsers to ensure it's a number and avoid SQL injection
    if (typeof numOfUsers !== 'number' || numOfUsers <= 0) {
      throw new Error('Invalid number of users');
    }

    // Fetch owners and count their parking logs
    const topOwners = await prisma.$queryRaw`
    SELECT
      Cars.OwnerID,
      Users.FirstName,
      Users.LastName,
      Users.Email,
      COUNT(*) AS logCount
    FROM parkingLog
    JOIN Cars ON parkingLog.CarID = Cars.idCars
    JOIN Users ON Cars.OwnerID = Users.idUsers
    GROUP BY
      Cars.OwnerID,
      Users.FirstName,
      Users.LastName,
      Users.Email
    ORDER BY logCount DESC
    LIMIT ${numOfUsers};


    `;

    return topOwners; // This will be a list of owners with their log counts
  } catch (err) {
    console.error('Error calculating most active users:', err);
    throw new Error('Unable to calculate most active users');
  }
}

async function calculateIncomeByTimeFrame(startDate, endDate) {
  try {
    // Validate the input dates using Zod or your schema validation method
    userSubscriptionDateSchema.parse({ startDate, endDate });

    // Fetch user subscriptions within the specified time frame, including related subscription plans
    const allSubscriptions = await prisma.userSubscriptions.findMany({
      where: {
        StartDate: { gte: new Date(startDate), lte: new Date(endDate) } // Ensure it's within the start and end dates
      },
      include: {
        SubscriptionPlans: true // Include SubscriptionPlans to access the Price field
      }
    });

    // Initialize income data object
    const incomeData = {
      incomeByMonth: {},
      totalIncome: 0
    };

    // Aggregate income by month and calculate total income
    allSubscriptions.forEach((subscription) => {
      const subscriptionStartDate = new Date(subscription.StartDate);
      const year = subscriptionStartDate.getFullYear();
      const month = subscriptionStartDate.getMonth() + 1; // Months are 0-indexed, so add 1
      const key = `${year}-${month.toString().padStart(2, '0')}`; // Format as "YYYY-MM"

      // Initialize the month if not already in the accumulator
      if (!incomeData.incomeByMonth[key]) {
        incomeData.incomeByMonth[key] = 0;
      }

      // Add to the corresponding month's income and total income
      const price = parseFloat(subscription.SubscriptionPlans.Price); // Convert Decimal to Number
      incomeData.incomeByMonth[key] += price;
      incomeData.totalIncome += price; // Accumulate into the total income
    });

    return incomeData;
  } catch (error) {
    console.error('Error calculating income by time frame:', error.message);
    throw error;
  }
}

async function viewSlotsByStatusAreaCity(cityId, active, areaId) {
  try {
    // Validate input using the Zod schema
    const validatedInput = viewSlotsSchema.parse({ cityId, active, areaId });

    // Construct the where clause based on validated filters
    const whereClause = {
      Areas: { CityID: validatedInput.cityId } // CityID is required
    };

    if (validatedInput.active !== undefined) {
      whereClause.Active = validatedInput.active; // Use validated boolean value
    }

    if (validatedInput.areaId !== undefined) {
      whereClause.AreaID = validatedInput.areaId; // Use validated number
    }

    // Fetch the slots based on the constructed where clause
    const slots = await prisma.slots.findMany({
      where: whereClause,
      include: {
        Areas: {
          include: {
            Cities: true // Include related Cities for more context if needed
          }
        }
      }
    });

    return slots;
  } catch (error) {
    console.error('Error fetching slots by status, area, and city:', error);
    throw new Error('Failed to fetch slots');
  }
}

async function updateSlotByID(idSlots, { BorderRight, Active }) {
  try {
    const validatedInput = updateSlotSchema.parse({ BorderRight, Active });
    const existingSlot = await prisma.slots.findUnique({
      where: { idSlots: validatedInput.idSlots }
    });
    if (!existingSlot) {
      throw new Error('Slot not found');
    }

    const fieldsToUpdate = {};
    if (validatedInput.BorderRight !== undefined && existingSlot.BorderRight !== validatedInput.BorderRight) {
      fieldsToUpdate.BorderRight = validatedInput.BorderRight;
    }
    if (validatedInput.Active !== undefined && existingSlot.Active !== validatedInput.Active) {
      fieldsToUpdate.Active = validatedInput.Active;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return { message: 'No changes detected; no update performed.' };
    }

    const updatedSlot = await prisma.slots.update({
      where: { idSlots: validatedInput.idSlots },
      data: fieldsToUpdate
    });
    return updatedSlot;
  } catch (error) {
    console.error('Error updating slot:', error);
    throw new Error(error.message || 'Internal Server Error');
  }
}

async function updateSlotsByCriteria({ cityId, areaId, active, updates }) {
  try {
    // Validate criteria and update data
    const validatedCriteria = updateCriteriaSchema.parse({ cityId, areaId, active });
    const validatedUpdates = updateSlotSchema.parse(updates);

    // Build the criteria for selecting slots
    const updateCriteria = {
      CityID: validatedCriteria.cityId,
      ...(validatedCriteria.areaId && { AreaID: validatedCriteria.areaId }),
      ...(validatedCriteria.active !== undefined && { Active: validatedCriteria.active })
    };

    // Prepare the data to update
    const updateData = {};
    if (validatedUpdates.BorderRight !== undefined) {
      updateData.BorderRight = validatedUpdates.BorderRight;
    }
    if (validatedUpdates.Active !== undefined) {
      updateData.Active = validatedUpdates.Active;
    }

    // Perform the update operation
    const updatedSlots = await prisma.slots.updateMany({
      where: updateCriteria,
      data: updateData
    });

    return updatedSlots;
  } catch (error) {
    console.error('Error updating slots by criteria:', error);
    throw new Error('Internal Server Error');
  }
}
async function deleteSlotsByCriteria(criteria) {
  // Validate the criteria using Zod
  const validatedCriteria = deleteSlotsCriteriaSchema.parse(criteria);

  try {
    // Build the query filters based on the validated criteria
    const filters = {
      CityID: validatedCriteria.cityId,
      ...(validatedCriteria.areaId !== undefined && { AreaID: validatedCriteria.areaId }),
      ...(validatedCriteria.active !== undefined && { Active: validatedCriteria.active })
    };

    // Perform the deletion
    const deletedSlots = await prisma.slots.deleteMany({
      where: filters
    });

    return deletedSlots;
  } catch (error) {
    console.error('Error deleting slots:', error);
    throw new Error('Failed to delete slots');
  }
}

async function deleteSlotByID(idSlots) {
  try {
    // Attempt to delete the slot by its ID
    const deletedSlot = await prisma.slots.delete({
      where: { idSlots: parseInt(idSlots, 10) } // Ensure ID is an integer
    });

    // Return the deleted slot details
    return deletedSlot;
  } catch (error) {
    // Handle cases where the slot was not found or other errors
    if (error.code === 'P2025') {
      // Prisma error code for record not found
      return { message: 'Slot not found' };
    }

    // Log and rethrow other errors
    console.error('Error deleting slot:', error);
    throw new Error('Error deleting slot');
  }
}
async function getUsersByCriteria(criteria) {
  try {
    // Validate criteria using Zod
    const validatedParams = UserCriteriaSchema.parse(criteria);

    // Destructure the validated criteria object
    const { subscriptionStatus, SubscriptionPlanName, FirstName, LastName, Phone, Email, Violations } = validatedParams;

    // Construct the Prisma query
    const users = await prisma.users.findMany({
      where: {
        AND: [
          // Include conditions only if the respective field is provided
          ...(subscriptionStatus || SubscriptionPlanName
            ? [
                {
                  UserSubscriptions: {
                    some: {
                      Status: subscriptionStatus || undefined,
                      SubscriptionPlans: {
                        Name: SubscriptionPlanName || undefined
                      }
                    }
                  }
                }
              ]
            : []),
          ...(FirstName ? { FirstName } : {}),
          ...(LastName ? { LastName } : {}),
          ...(Phone ? { Phone } : {}),
          ...(Email ? { Email } : {}),
          ...(Violations !== undefined ? { violations: { gte: Violations } } : {})
        ]
      },
      include: {
        UserSubscriptions: {
          include: {
            SubscriptionPlans: true
          }
        }
      }
    });

    return users;
  } catch (error) {
    console.error('Error fetching users by criteria:', error);
    throw new Error('Error fetching users by criteria');
  }
}

async function toggleSubscriptionStatusById(idUserSubscriptions) {
  try {
    const validatedID = IdSchema.parse(idUserSubscriptions);
    const existingSubscription = await prisma.userSubscriptions.findUnique({
      where: { idUserSubscriptions: validatedID.idUserSubscriptions }
    });
    if (!existingSubscription) {
      throw new Error('Subscription not found');
    }
    return existingSubscription;
  } catch (error) {
    console.error('Error toggling subscription status:', error);
    throw new Error(error.message || 'Internal Server Error');
  }
}
//get sub id by sub name

module.exports = {
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
  updateSlotsByCriteria,
  deleteSlotsByCriteria,
  deleteSlotByID,
  getUsersByCriteria,
  toggleSubscriptionStatusById
};
