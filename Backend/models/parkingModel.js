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
  ReservationCreateSchema,
  deleteReservationSchema
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
          SlotID: slot.idSlots,
          Status: 'pending'
        }
      });
      return reservation;
    }
  } catch (err) {
    console.error('Error finding and booking slot:', err);
    throw err;
  }
}

const cancelReservation = async (idReservation, idUsers = null) => {
  console.log('Validating Zod in model');

  // Validate the data using Zod
  const parsedData = deleteReservationSchema.parse({
    idReservation,
    idUsers
  });

  console.log('Done Zod validation');

  // Extract validated data
  const { idReservation: validatedIdReservation, idUsers: validatedIdUsers } = parsedData;

  // Check for reservation in the database
  const reservation = await prisma.reservations.findUnique({
    where: { idReservation: validatedIdReservation }
  });

  if (!reservation) {
    throw new Error('Reservation not found');
  }

  // Authorization check
  if (validatedIdUsers && reservation.UserID !== validatedIdUsers) {
    throw new Error('Unauthorized to cancel this reservation');
  }

  // Proceed with deletion
  await prisma.reservations.delete({
    where: { idReservation: validatedIdReservation }
  });
};

module.exports = {
  getAllParkingLots,
  countActiveReservations,
  fetchAllCarIdsByUserID,
  maxReservationsByUser,
  findAndBookSlot,
  cancelReservation
};

//TODO

// check if user can add more reservations then max allowed
// work on notifications for upcoming reservation, for violations, for late exit in case of a reservation
//(remember to implement max hours for a reservation and max hours for regular parking)
//user should be able to see his parking stats/ reservations stats. meaning when it starts when it ends, how long is left in case it already started
//delete reservation once done

//once frontend is half ready start working on notifications

//when user drives in- we need to check if he has reservation.
//if not-parking end in parkingLog is set to the max which was predefined
//otherwise it's set to whatever the reservation is currently
//in that case we should add another field to parkingLog called maxEnd or something.
//because the endDate it has right now could be triggered by him just leaving

//max durations for reservations and non reservations-local or db?

//go through the code and make sure that models throw exceptions that are properly caught by the controllers
//cancel reservation flow is a good example
