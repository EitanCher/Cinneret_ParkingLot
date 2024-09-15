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
  deleteReservationSchema,
  setExitTimeModelSchema
} = require('../db-postgres/zodSchema');
const { subMonths, startOfDay, endOfDay } = require('date-fns');

const { promise } = require('zod');
const saltRounds = 10;
const maxDurationReservation = 24;
const maxDurationParkingNoReservation = 6;

const idCitySchema = z.number().int().positive();
const reservationStartSchema = z.date();
const idUsersSchema = z.number().int().positive();
const getAllParkingLots = async () => {
  try {
    console.log('start of try block in model');
    const cities = await prisma.cities.findMany({
      select: {
        CityName: true,
        FullAddress: true,
        pictureUrl: true,
        idCities: true
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
  try {
    // Validate input
    const cityIdValidated = z.number().int().positive().parse(cityId);

    // Fetch areas for the given city ID
    const areas = await prisma.areas.findMany({
      where: {
        CityID: cityIdValidated // Filter by the single city ID
      },
      select: {
        idAreas: true
      }
    });

    // Return the list of area IDs
    return areas.map((area) => area.idAreas);
  } catch (err) {
    console.error('Error fetching area IDs by city ID:', err.message);
    throw err;
  }
}

async function findBestSlot(idCities, reservationStart) {
  try {
    // Validate inputs
    idCitySchema.parse(idCities);
    reservationStartSchema.parse(new Date(reservationStart));

    // Convert reservationStart to Date object
    const reservationStartDate = new Date(reservationStart);

    // Get Area IDs for the given city ID
    const areaIds = await getAreaIdsByCityId(idCities);
    if (areaIds.length === 0) {
      console.log('No areas found for the city ID: ' + idCities);
      return { success: false, message: 'No areas found for the city.' };
    }

    // Find all available slots starting at reservationStart
    const slots = await prisma.slots.findMany({
      where: {
        AreaID: {
          in: areaIds
        },
        Active: true,
        Reservations: {
          none: {
            ReservationStart: {
              lt: reservationStartDate
            }
          }
        }
      },
      include: {
        Reservations: true // Include reservations to calculate availability
      }
    });

    if (slots.length === 0) {
      console.log('No available slots found');
      return { success: false, message: 'No available slots found for the given criteria.' };
    }

    // Find the slot with the maximum duration
    let maxDuration = 0;
    let bestSlot = null;

    for (const slot of slots) {
      // Filter reservations that start after the requested time
      const futureReservations = slot.Reservations.filter((r) => new Date(r.ReservationStart) > reservationStartDate);

      // Determine the earliest future reservation start time
      const nextReservationStart =
        futureReservations.length > 0
          ? Math.min(...futureReservations.map((r) => new Date(r.ReservationStart).getTime()))
          : reservationStartDate.getTime() + maxDurationReservation * 60 * 60 * 1000;

      // Calculate the maximum possible duration for this slot
      const maxAllowedEnd = reservationStartDate.getTime() + maxDurationReservation * 60 * 60 * 1000;
      const slotEnd = new Date(Math.min(nextReservationStart, maxAllowedEnd));

      const duration = (slotEnd.getTime() - reservationStartDate.getTime()) / (60 * 60 * 1000);

      if (duration > maxDuration) {
        maxDuration = duration;
        bestSlot = slot;
      }
    }

    return bestSlot ? { success: true, slot: bestSlot, maxDuration } : { success: false, message: 'No suitable slot found.' };
  } catch (err) {
    console.error('Error finding best slot:', err.message);
    return { success: false, message: 'An error occurred while finding the best slot.' };
  }
}

const createReservation = async (userId, carId, slotId, reservationStart, duration) => {
  try {
    // Calculate the end time based on the start time and duration
    const reservationEnd = new Date(reservationStart.getTime() + duration * 60 * 60 * 1000);

    // Validate the reservation (e.g., slot availability)
    // Assuming you have a model function `validateSlotAvailability`
    const isSlotAvailable = await validateSlotAvailability(slotId, reservationStart, reservationEnd);
    if (!isSlotAvailable) {
      throw new Error('Slot is no longer available');
    }

    // Create the reservation
    const reservation = await prisma.reservations.create({
      data: {
        CarID: carId,
        UserID: userId,
        ReservationStart: reservationStart,
        ReservationEnd: reservationEnd,
        SlotID: slotId,
        Status: 'pending'
      }
    });

    return reservation;
  } catch (err) {
    console.error('Error creating reservation:', err.message);
    throw err;
  }
};
const validateSlotAvailability = async (slotId, reservationStart, reservationEnd) => {
  try {
    // Check if the slot is available for the given reservation period
    const slot = await prisma.slots.findUnique({
      where: { idSlots: slotId },
      include: {
        Reservations: {
          where: {
            ReservationStart: {
              lt: reservationEnd
            },
            ReservationEnd: {
              gt: reservationStart
            }
          }
        }
      }
    });

    // Return true if the slot is available (no conflicting reservations)
    return slot && slot.Reservations.length === 0;
  } catch (err) {
    console.error('Error validating slot availability:', err.message);
    throw err;
  }
};

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
const carIdSchema = z.number().int().positive();
const fetchReservationsByCarID = async (idCars) => {
  try {
    carIdSchema.parse(idCars);
    const currentTime = new Date();
    const reservations = await prisma.reservations.findFirst({
      where: {
        idCars: idCars,
        startDate: {
          lte: currentTime
        },
        endDate: {
          gte: currentTime
        }
      }
    });
    return reservations || null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', error.errors);
      throw new Error('Invalid car ID');
    }
    console.error('Error fetching reservations by car ID:', error);
    throw new Error('Unable to fetch reservations');
  }
};

const setExitTimeModel = async (idCars, exitTime) => {
  // Validate input parameters and throw an error if invalid
  setExitTimeModelSchema.parse({ idCars, exitTime });

  try {
    await prisma.parkingLog.update({
      where: { idCars: idCars },
      data: { NeedToExitBy: exitTime }
    });
  } catch (error) {
    // Handle error (e.g., logging, rethrowing, etc.)
    throw new Error('Failed to update the parking log');
  }
};

//NEEDS TESTING
const fetchParkingHistoryByUserId = async (idUsers, { startDate, endDate, registration, slotNumber, carModel, violationStatus }) => {
  try {
    // Validate idUsers
    idUsersSchema.parse(idUsers);

    // Validate and handle date range
    const now = new Date();
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;

    if (start) {
      if (isNaN(start.getTime())) {
        throw new Error('Invalid start date format');
      }
      if (end) {
        if (isNaN(end.getTime())) {
          throw new Error('Invalid end date format');
        }
        if (end > now) {
          throw new Error('End date cannot be in the future');
        }
        if (end.getTime() - start.getTime() > 30 * 24 * 60 * 60 * 1000) {
          throw new Error('Date range cannot exceed 1 month');
        }
      } else {
        end = now;
      }
    } else {
      start = now;
      end = now;
    }

    // Convert violationStatus to boolean if it's provided
    let violationBoolean = undefined;
    if (violationStatus !== undefined) {
      violationBoolean = violationStatus.toLowerCase() === 'true';
    }

    // Fetch parking logs with Prisma
    const parkingLogs = await prisma.parkingLog.findMany({
      where: {
        Cars: {
          OwnerID: idUsers,
          RegistrationID: registration ? { contains: registration, mode: 'insensitive' } : undefined,
          Model: carModel ? { contains: carModel, mode: 'insensitive' } : undefined
        },
        Slots: {
          idSlots: slotNumber ? { equals: Number(slotNumber) } : undefined
        },
        Violation: violationBoolean,
        Entrance: {
          gte: start,
          lte: end
        }
      },
      orderBy: { Entrance: 'desc' },
      include: {
        Cars: true
      }
    });

    return parkingLogs;
  } catch (error) {
    console.error('Error fetching parking history by user ID:', error.message);
    throw new Error('Unable to fetch parking history');
  }
};
//NEEDS TESTING
const fetchTotalParkingTimeByUser = async (idUsers) => {
  try {
    idUsersSchema.parse(idUsers);
    const parkingLogs = await prisma.parkingLog.findMany({
      where: {
        Cars: {
          OwnerID: idUsers
        }
      },
      include: {
        Cars: true
      }
    });

    let totalTime = 0;
    for (let log of parkingLogs) {
      const entrance = new Date(log.Entrance);
      const exit = log.Exit ? new Date(log.Exit) : null;
      const duration = exit ? exit.getTime() - entrance.getTime() : 0;
      totalTime += duration;
    }

    return totalTime;
  } catch (error) {
    console.error('Error fetching total parking time by user ID:', error.message);
    throw new Error('Unable to fetch total parking time');
  }
};

//NEEDS TESTING
const fetchAverageParkingTimeByUser = async (idUsers) => {
  try {
    const totalParkingTime = await fetchTotalParkingTimeByUser(idUsers);

    // Fetch the number of parking logs for the user
    const parkingLogsCount = await prisma.parkingLog.count({
      where: {
        Cars: {
          OwnerID: idUsers
        }
      }
    });

    // If no logs are found, return null
    if (parkingLogsCount === 0) {
      return null;
    }

    // Compute the average duration in milliseconds
    const averageDuration = totalParkingTime / parkingLogsCount;

    // Return the average parking time in seconds
    return averageDuration / 1000; // Convert milliseconds to seconds
  } catch (error) {
    console.error('Error fetching average parking time by user ID:', error.message);
    throw new Error('Unable to fetch average parking time');
  }
};

const findCityById = async (cityId) => {
  try {
    return await prisma.cities.findUnique({
      where: {
        idCities: cityId
      },
      select: {
        idCities: true // Only fetch city ID to verify existence
      }
    });
  } catch (error) {
    console.error('Error finding city by ID:', error.message);
    throw new Error('Database error: Unable to find city');
  }
};

// Model function to count total slots and busy slots (Busy == true) associated with a city ID
const countSlotsByCityId = async (cityId) => {
  try {
    if (isNaN(cityId)) throw new Error('Invalid city ID: ' + cityId);
    // Find areas related to the given city
    const areas = await prisma.areas.findMany({
      where: {
        CityID: cityId
      },
      select: {
        idAreas: true
      }
    });

    // Extract area IDs from the result
    const areaIds = areas.map((area) => area.idAreas);

    // Count total slots in these areas
    const totalSlotsCount = await prisma.slots.count({
      where: {
        AreaID: {
          in: areaIds
        }
      }
    });

    // Count slots where Busy == true in these areas
    const availableSlotsCount = await prisma.slots.count({
      where: {
        AreaID: {
          in: areaIds
        },
        Busy: false // Only count where Busy is true
      }
    });

    return {
      totalSlotsCount,
      availableSlotsCount
    };
  } catch (error) {
    console.error('Error counting slots by city ID:', error.message);
    throw new Error('Database error: Unable to count slots');
  }
};

module.exports = {
  getAllParkingLots,
  countActiveReservations,
  fetchAllCarIdsByUserID,
  maxReservationsByUser,
  findBestSlot,
  createReservation,
  cancelReservation,
  fetchReservationsByCarID,
  setExitTimeModel,
  fetchParkingHistoryByUserId,
  fetchTotalParkingTimeByUser,
  fetchAverageParkingTimeByUser,
  getAreaIdsByCityId,
  findCityById,
  countSlotsByCityId
};

//TODO

// check if user can add more reservations then max allowed
// work on notifications for upcoming reservation, for violations, for late exit in case of a reservation
//(remember to implement max hours for a reservation and max hours for regular parking)

//once frontend is half ready start working on notifications (fault, upcoming reservation etcetc)

//when user drives in- we need to check if he has reservation.
//if not-parking end in parkingLog is set to the max which was predefined
//otherwise it's set to whatever the reservation is currently
//in that case we should add another field to parkingLog called maxEnd or something.
//because the endDate it has right now could be triggered by him just leaving

//max durations for reservations and non reservations-local or db?

//go through the code and make sure that models throw exceptions that are properly caught by the controllers
//cancel reservation flow is a good example

//when car enters parking lot at the time of the reservation: make the reservation status active

//Ask EITAN who should do it
//add column in parking log for when the car enters parking lot without reservation. that way we know if he stayed too long (12 hrs i think?)
// and once the car leaves we prepare an endpoint to check if a violation occurred and add a violation strike to the user

//add map to frontend to navigate to any parking lot

//real time parking lot available spaces

//Integration with Calendar: Sync parking history with calendar events or reminders.

//admin should have quick buttons like open gate, deactivate slot etc etc etc
