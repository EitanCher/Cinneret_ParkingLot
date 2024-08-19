//TODO: Make sure to check subscription status when accessing dashboard
//TODO: notifications when subscriptions about to expire
//TODO: option to extend subscription (take end date and add as start date of new subscription);

// cronJob.js
const cron = require('node-cron');
const prisma = require('../prisma/prismaClient'); // Adjust path as needed

cron.schedule('0 0 * * *', async () => {
  // Runs daily at midnight
  try {
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
    console.log('Subscription statuses updated to expired.');
  } catch (error) {
    console.error('Error updating subscription statuses:', error.message);
  }
});
