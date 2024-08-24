const pool = require('../db-postgres/db_config');
const prisma = require('../prisma/prismaClient');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { hashPassword } = require('../utils/passwordUtils');
const { convertToISODate } = require('../utils/dateUtils');
const {
  updateUserSchema,
  addUserControllerSchema,
  carSchema,
  carsArraySchema,
  ReservationCreateSchema
} = require('../db-postgres/zodSchema');
const { promise } = require('zod');
const saltRounds = 10;

const getAllParkingLots = async () => {
  try {
    console.log('start of try block in model');
    const cities = await prisma.cities.findMany({
      select: {
        CityName: true
      }
    });
    return { cities };
  } catch (err) {
    console.error('Error getting parking lots:', err.message);
  }
};

const fetchAllCarIdsByUserID = async (idUsers) => {
  try {
    // Fetch all cars where OwnerID matches idUsers
    const cars = await prisma.cars.findMany({
      where: {
        OwnerID: idUsers
      },
      select: {
        idCars: true // Select only the idCars field
      }
    });

    // Extract and return an array of car IDs
    return cars.map((car) => car.idCars);
  } catch (error) {
    console.error('Error fetching car IDs:', error.message);
    throw new Error('Unable to fetch car IDs');
  }
};

const maxReservationsByUser = async (idUsers) => {
  try {
    // Fetch the Subscription Plan ID for the user
    const subscriptionPlan = await prisma.userSubscriptions.findFirst({
      where: {
        UserID: idUsers,
        Status: 'active' // You might need to adjust this to match your schema logic
      },
      select: {
        SubscriptionPlanID: true
      }
    });

    if (!subscriptionPlan) {
      throw new Error('No active subscription found for this user.');
    }

    // Fetch the max reservations allowed for the user's subscription plan
    const maxReservations = await prisma.subscriptionPlans.findUnique({
      where: {
        idSubscriptionPlans: subscriptionPlan.SubscriptionPlanID
      },
      select: {
        MaxActiveReservations: true
      }
    });

    if (!maxReservations) {
      throw new Error('No subscription plan found for this user.');
    }

    return maxReservations.MaxReservations;
  } catch (error) {
    console.error('Error fetching max reservations by user:', error.message);
    throw new Error('Unable to fetch max reservations');
  }
};

const countActiveReservations = async (carIds) => {
  try {
    // Check if carIds is an array and has at least one ID
    if (!Array.isArray(carIds) || carIds.length === 0) {
      throw new Error('carIds must be a non-empty array');
    }

    // Count active reservations where CarID is one of the carIds and ReservationEnd is in the future
    const activeReservationsCount = await prisma.reservations.count({
      where: {
        CarID: {
          in: carIds // Filter by car IDs in the array
        },
        ReservationEnd: {
          gte: new Date() // Ensure the reservation end date is in the future
        }
      }
    });

    return activeReservationsCount;
  } catch (error) {
    console.error('Error fetching active reservations:', error.message);
    throw new Error('Unable to fetch active reservations');
  }
};
async function getAreaIdsByCityId(cityId) {
  const areas = await prisma.areas.findMany({
    where: {
      CityID: cityId // Filter by city ID
    },
    select: {
      idAreas: true
    }
  });

  return areas.map((area) => area.idAreas);
}

async function findAndBookSlot(cityId, carId, userId, reservationStart, reservationEnd) {
  try {
    // Step 1: Get Area IDs for the given city

    const areaIds = await getAreaIdsByCityId(cityId);
    if (areaIds.length === 0) {
      console.log('no areas found for the city id: ' + cityId);
      return null;
    }

    // Step 2: Find the first available slot within those areas

    const slot = await prisma.slots.findFirst({
      where: {
        AreaID: {
          in: areaIds
        },
        Active: true,
        Reservations: {
          none: {
            ReservationStart: {
              lt: reservationEnd
            },
            ReservationEnd: {
              gt: reservationStart
            }
          }
        }
      },
      orderBy: {
        idSlots: 'asc'
      }
    });
    if (!slot) {
      console.log('no available slot found');
      return null;
    }

    // Step 3: If a slot is found, create a reservation
    else {
      //validate the reservation

      ReservationCreateSchema.parse({
        CarID: carId,
        UserID: userId,
        SlotID: slot.idSlots, // Placeholder for validation, actual SlotID will be set later
        ReservationStart: reservationStart,
        ReservationEnd: reservationEnd
      });
      const reservation = await prisma.reservations.create({
        data: {
          CarID: carId,
          UserID: userId,
          ReservationStart: reservationStart,
          ReservationEnd: reservationEnd,
          SlotID: slot.idSlots
        }
      });
      return reservation;
    }
  } catch (err) {
    console.error('Error finding and booking slot:', err);
    throw err;
  }
}

module.exports = {
  getAllParkingLots,
  countActiveReservations,
  fetchAllCarIdsByUserID,
  maxReservationsByUser,
  findAndBookSlot
  // Add other functions as needed...
};
