//TODO: Make sure to check subscription status when accessing dashboard
//TODO: notifications when subscriptions about to expire
//TODO: option to extend subscription (take end date and add as start date of new subscription);

// cronJob.js
const cron = require('node-cron');
const prisma = require('../prisma/prismaClient'); // Adjust path as needed

const checkExpiredSubscriptions = async () => {
  try {
    console.log('test');
    // any subscriptions with an EndDate before today will be marked as expired.
    await prisma.userSubscriptions.updateMany({
      where: {
        EndDate: { lt: new Date() },
        Status: 'active'
      },
      data: {
        Status: 'expired'
      }
    });
    console.log('Subscription statuses have been checked and changed to expired if needed.');
  } catch (error) {
    console.error('Error updating subscription statuses:', error.message);
  }
};

const checkReservations = async () => {
  console.log('checking reservations');

  try {
    // Fetch reservations that are pending and past their end time
    const reservations = await prisma.reservations.findMany({
      where: {
        Status: 'pending',
        ReservationEnd: {
          lt: new Date() // End time in the past
        }
      }
    });
    // Update violation count for users if any reservation violates any rule
    for (const reservation of reservations) {
      await prisma.users.updateMany({
        where: { idUsers: reservation.UserID },
        data: {
          violations: { increment: 1 } // Increment violation count by 1
        }
      });
      await prisma.reservations.deleteMany({
        where: { idReservation: reservations.idReservation } // Delete reservation after violation update
      });
    }
  } catch (error) {}
};

cron.schedule('* * * * *', checkExpiredSubscriptions); // Run daily at midnight
cron.schedule('* * * * *', checkReservations); // Run daily at midnight

//just changed it to every minute
