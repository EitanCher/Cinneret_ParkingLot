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
  IdSchema,
  SlotCreateSchema,
  createSubscriptionPlanSchema
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
      BorderRight: Math.floor(Math.random() * 100), /// NEED TO DECIDE WHAT TO DO WITH THIS
      SlotIp: null,
      CameraIP: null
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
    // The schema is already validated in the controller function
    const subscription = await prisma.subscriptionPlans.create({
      data: {
        Name: data.name,
        Price: data.price,
        MaxCars: data.maxCars,
        MaxActiveReservations: data.maxActiveReservations,
        Features: data.features
      }
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
    console.log('id is ' + idSubscriptionPlans);
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

function convertBigIntToString(data) {
  //for postgres count(*)
  return JSON.parse(JSON.stringify(data, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));
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
        "Cars"."OwnerID",
        "Users"."FirstName",
        "Users"."LastName",
        "Users"."Email",
        COUNT(*) AS logCount
      FROM "ParkingLog"
      JOIN "Cars" ON "ParkingLog"."CarID" = "Cars"."idCars"
      JOIN "Users" ON "Cars"."OwnerID" = "Users"."idUsers"
      GROUP BY
        "Cars"."OwnerID",
        "Users"."FirstName",
        "Users"."LastName",
        "Users"."Email"
      ORDER BY logCount DESC
      LIMIT ${numOfUsers};
    `;

    // Convert any BigInt to String
    return convertBigIntToString(topOwners);
  } catch (err) {
    console.error('Error calculating most active users:', err);
    throw new Error('Unable to calculate most active users');
  }
}

async function calculateIncomeByTimeFrame({ startDate, endDate }) {
  try {
    console.log('startDate and endDate in model:', startDate, endDate);

    // Validate that startDate and endDate are valid Date objects
    if (!(startDate instanceof Date) || isNaN(startDate.getTime()) || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format.');
    }

    // Fetch user subscriptions within the specified time frame, including related subscription plans
    const allSubscriptions = await prisma.userSubscriptions.findMany({
      where: {
        StartDate: { gte: startDate, lte: endDate } // Use Date objects directly
      },
      include: {
        SubscriptionPlans: true // Include SubscriptionPlans to access the Price field
      }
    });

    console.log('Fetched subscriptions:', allSubscriptions);

    // Calculate total income
    let totalIncome = 0;

    allSubscriptions.forEach((subscription) => {
      const price = parseFloat(subscription.SubscriptionPlans.Price); // Convert Decimal to Number
      totalIncome += price; // Accumulate into the total income
    });

    console.log('Total income:', totalIncome);

    return { totalIncome };
  } catch (error) {
    console.error('Error calculating income by time frame:', error.message);
    throw error;
  }
}

async function viewSlotsByCriteria(cityId, active, areaId, busy) {
  try {
    // Validate input using the Zod schema
    const validatedInput = viewSlotsSchema.parse({ cityId, active, areaId, busy });

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

    if (validatedInput.busy !== undefined) {
      whereClause.Busy = validatedInput.busy; // Use validated boolean value
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

// Updated model function to handle all fields
async function updateSlotByID(idSlots, { BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP }) {
  try {
    // Ensure idSlots is parsed correctly
    const slotId = parseInt(idSlots, 10);

    // Create a schema that validates all fields
    const validatedInput = updateSlotSchema.parse({ BorderRight, Active, Busy, Fault, AreaID, CameraIP, SlotIP });
    console.log(validatedInput);

    // Check if slotId is valid
    if (isNaN(slotId)) {
      throw new Error('Invalid slot ID');
    }

    // Check if the slot exists
    const existingSlot = await prisma.slots.findUnique({
      where: { idSlots: slotId }
    });

    if (!existingSlot) {
      throw new Error('Slot not found');
    }
    console.log('slot found');

    // Create fields to update based on the validated input
    const fieldsToUpdate = {};
    for (const key in validatedInput) {
      if (validatedInput[key] !== undefined && existingSlot[key] !== validatedInput[key]) {
        fieldsToUpdate[key] = validatedInput[key];
      }
    }

    // If no fields to update, return a message
    if (Object.keys(fieldsToUpdate).length === 0) {
      return { message: 'No changes detected; no update performed.' };
    }
    console.log('changes indeeed detected');
    // Update the slot with the fieldsToUpdate object
    const updatedSlot = await prisma.slots.update({
      where: { idSlots: slotId },
      data: fieldsToUpdate
    });
    console.log('updated slot:', updatedSlot);

    return updatedSlot;
  } catch (error) {
    console.error('Error updating slot:', error);
    throw new Error(error.message || 'Internal Server Error');
  }
}

async function addIndividualSlotModel(slotData) {
  try {
    // Validate the slot data using the SlotCreateSchema
    const validatedData = SlotCreateSchema.parse(slotData);

    console.log('Validated data to be added:', validatedData);

    // Create a new slot in the database using Prisma's create method
    const newSlot = await prisma.slots.create({
      data: validatedData
    });

    console.log('New slot added successfully:', newSlot);

    return newSlot; // Return the newly created slot
  } catch (error) {
    console.error('Error adding new slot:', error);
    throw new Error(error.message || 'Internal Server Error');
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
    console.log('Raw Criteria:', criteria); // Log raw criteria

    // Validate the criteria using the Zod schema
    const validatedParams = UserCriteriaSchema.parse(criteria);
    console.log('Validated Params:', JSON.stringify(validatedParams, null, 2)); // Log validated params

    // Destructure the validated parameters
    const { subscriptionStatus, SubscriptionPlanName, FirstName, LastName, Phone, Email, Violations, Role } = validatedParams;
    console.log('Destructured Values:', { subscriptionStatus, SubscriptionPlanName, FirstName, LastName, Phone, Email, Violations, Role });

    // Query the database using Prisma
    const users = await prisma.users.findMany({
      where: {
        AND: [
          ...(Role ? [{ Role }] : []),
          ...(FirstName ? [{ FirstName: { equals: FirstName } }] : []), // Ensure exact match for FirstName
          ...(LastName ? [{ LastName }] : []),
          ...(Phone ? [{ Phone }] : []),
          ...(Email ? [{ Email }] : []),
          ...(Violations !== undefined ? [{ Violations: Violations }] : []), // Exact match
          {
            UserSubscriptions: {
              some: {
                ...(subscriptionStatus ? { Status: subscriptionStatus } : {}),
                ...(SubscriptionPlanName
                  ? {
                      SubscriptionPlans: {
                        Name: SubscriptionPlanName
                      }
                    }
                  : {})
              }
            }
          }
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

async function getAllUsers() {
  try {
    // Fetch all users without any criteria
    const users = await prisma.users.findMany({
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
    console.error('Error fetching all users:', error);
    throw new Error('Error fetching all users');
  }
}

async function getUserCounts() {
  try {
    const inactiveUserCount = await prisma.users.count({
      where: {
        UserSubscriptions: {
          some: {
            OR: [{ Status: 'pending' }, { Status: 'expired' }, { Status: 'canceled' }]
          }
        }
      }
    });

    const activeUserCount = await prisma.users.count({
      where: {
        UserSubscriptions: {
          some: {
            Status: 'active'
          }
        }
      }
    });

    const totalUserCount = inactiveUserCount + activeUserCount;

    return { inactiveUserCount, activeUserCount, totalUserCount };
  } catch (error) {
    console.error('Error getting user counts:', error);
    throw new Error('Error getting user counts');
  }
}
//get sub id by sub name

async function getParkingLotsFaultsModel(cityId = null) {
  try {
    let faultyGates, faultySlots;

    if (cityId && !isNaN(cityId)) {
      // Fetch faulty gates and slots for the provided city ID
      faultyGates = await prisma.gates.findMany({
        where: {
          Fault: true,
          CityID: parseInt(cityId)
        },
        include: {
          Cities: {
            select: {
              CityName: true,
              idCities: true // Include City ID if needed
            }
          }
        }
      });

      faultySlots = await prisma.slots.findMany({
        where: {
          Fault: true,
          Areas: {
            CityID: parseInt(cityId)
          }
        },
        include: {
          Areas: {
            select: {
              AreaName: true,
              idAreas: true, // Include Area ID if needed
              Cities: {
                select: {
                  CityName: true,
                  idCities: true // Include City ID if needed
                }
              }
            }
          }
        }
      });
    } else {
      // Fetch all faulty gates and slots
      faultyGates = await prisma.gates.findMany({
        where: {
          Fault: true
        },
        include: {
          Cities: {
            select: {
              CityName: true,
              idCities: true // Include City ID if needed
            }
          }
        }
      });

      faultySlots = await prisma.slots.findMany({
        where: {
          Fault: true
        },
        include: {
          Areas: {
            select: {
              AreaName: true,
              idAreas: true, // Include Area ID if needed
              Cities: {
                select: {
                  CityName: true,
                  idCities: true // Include City ID if needed
                }
              }
            }
          }
        }
      });
    }

    // Reshape the results to flatten the nested structure
    const reshapedFaultyGates = faultyGates.map((gate) => ({
      idGates: gate.idGates,
      CityName: gate.Cities.CityName,
      CityID: gate.Cities.idCities, // City ID
      CameraIP: gate.CameraIP, // Add other relevant fields here
      Fault: gate.Fault,
      Entrance: gate.Entrance
    }));

    const reshapedFaultySlots = faultySlots.map((slot) => ({
      idSlots: slot.idSlots,
      AreaName: slot.Areas.AreaName,
      AreaID: slot.Areas.idAreas, // Area ID
      CityName: slot.Areas.Cities.CityName,
      CityID: slot.Areas.Cities.idCities, // City ID
      Active: slot.Active,
      Fault: slot.Fault
    }));

    // Return the reshaped result
    return {
      faultyGates: reshapedFaultyGates,
      faultySlots: reshapedFaultySlots
    };
  } catch (error) {
    console.error('Error fetching parking lots faults:', error);
    throw new Error('Database query failed');
  }
}

async function getRecentSubscriptionsModel(limit) {
  try {
    const result = await prisma.userSubscriptions.findMany({
      where: {
        Status: 'active' // Filter for active subscriptions
      },
      take: parseInt(limit, 10), // Limit the number of results
      orderBy: {
        StartDate: 'desc' // Get the most recent subscriptions by start date
      },
      select: {
        Users: {
          select: {
            FirstName: true,
            LastName: true,
            Email: true
            // If you have a createdAt field for registration date, include it here
          }
        },
        SubscriptionPlans: {
          select: {
            Name: true,
            Price: true
          }
        },
        StartDate: true // Subscription start date
      }
    });

    const reshapedResult = result.map((item) => {
      return {
        Name: `${item.Users.FirstName} ${item.Users.LastName}`,
        Email: item.Users.Email,
        SubscriptionPlan: item.SubscriptionPlans.Name,
        Price: item.SubscriptionPlans.Price,
        StartDate: new Date(item.StartDate).toLocaleString()
      };
    });

    return reshapedResult;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching recent subscriptions');
  }
}

const calculateAverageParkingTimeAllUsers = async () => {
  try {
    // Fetch all parking logs with Entrance and Exit times
    const parkingLogs = await prisma.parkingLog.findMany({
      select: {
        Entrance: true,
        Exit: true
      }
    });
    console.log(parkingLogs.length);

    // If no logs are found, return null
    if (parkingLogs.length === 0) {
      return null;
    }

    // Calculate the total parking time in milliseconds
    const totalParkingTime = parkingLogs.reduce((total, log) => {
      if (log.Entrance && log.Exit) {
        const entranceTime = new Date(log.Entrance).getTime();
        const exitTime = new Date(log.Exit).getTime();
        const duration = exitTime - entranceTime; // Duration in milliseconds
        return total + duration;
      }
      return total;
    }, 0);

    // Compute the average duration in milliseconds
    const averageDurationMilliseconds = totalParkingTime / parkingLogs.length;

    // Convert average duration to hours
    const averageDurationHours = averageDurationMilliseconds / (1000 * 3600); // Convert milliseconds to hours

    // Format to one decimal place
    const formattedAverageDuration = parseFloat(averageDurationHours.toFixed(1));
    console.log(formattedAverageDuration);

    // Return the average parking time in hours with one decimal place
    return { formattedAverageDuration, dataPoints: parkingLogs.length };
  } catch (error) {
    console.error('Error calculating average parking time for all users:', error.message);
    throw new Error('Unable to fetch average parking time');
  }
};
async function getRecentParkingLogs(limit = 10) {
  try {
    const logs = await prisma.parkingLog.findMany({
      take: limit, // Limits the number of results
      orderBy: {
        Entrance: 'desc' // Retrieves the recent logs
      },
      include: {
        Cars: {
          select: {
            RegistrationID: true,
            Model: true,
            Users: {
              select: {
                FirstName: true,
                LastName: true
              }
            }
          }
        },
        Reservations: {
          select: {
            idReservation: true // Determines if there's a reservation
          }
        }
      }
    });

    return logs.map((log) => ({
      fullName: `${log.Cars.Users.FirstName} ${log.Cars.Users.LastName}`,
      carModel: log.Cars.Model,
      registrationNo: log.Cars.RegistrationID,
      reservation: log.Reservations !== null ? 'Has a reservation' : 'No reservation',
      entrance: new Date(log.Entrance).toLocaleString(), // Convert to readable format
      exit: new Date(log.Exit).toLocaleString(), // Convert to readable format
      needToExitBy: new Date(log.NeedToExitBy).toLocaleString() // Convert to readable format
    }));
  } catch (error) {
    throw new Error('Error fetching recent parking logs: ' + error.message);
  }
}
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
  viewSlotsByCriteria,
  updateSlotByID,
  addIndividualSlotModel,
  deleteSlotByID,
  getUsersByCriteria,
  toggleSubscriptionStatusById,
  getAllUsers,
  getUserCounts,
  getParkingLotsFaultsModel,
  getRecentSubscriptionsModel,
  calculateAverageParkingTimeAllUsers,
  getRecentParkingLogs
};
