const prisma = require('../prisma/prismaClient');

// Function to create a subscription
const createSubscription = async ({ userId, subscriptionPlanId, stripeSessionId }) => {
  // Fetch the subscription plan details

  // Calculate start and end dates
  const startDate = new Date();
  const endDate = calculateEndDate(startDate);

  const subscriptionPlan = await prisma.subscriptionPlans.findUnique({
    where: { idSubscriptionPlans: subscriptionPlanId },
    select: {
      Price: true,
      Name: true,
      Features: true
    }
  });

  if (!subscriptionPlan) {
    throw new Error('Subscription Plan not found');
  }

  // Check if the user already has a pending subscription
  const existingPendingSubscription = await prisma.userSubscriptions.findFirst({
    where: {
      UserID: userId,
      Status: 'pending'
    }
  });

  if (existingPendingSubscription) {
    // Update the existing pending subscription to active if there is a new subscription
    await prisma.userSubscriptions.update({
      where: { idUserSubscriptions: existingPendingSubscription.idUserSubscriptions },
      data: {
        SubscriptionPlanID: subscriptionPlanId,
        StripeSessionId: stripeSessionId,
        StartDate: startDate,
        EndDate: endDate
        // Optionally update other fields as needed
      }
    });

    return existingPendingSubscription; // Return the updated pending subscription
  }

  // Check if the user already has an active subscription
  const existingActiveSubscription = await prisma.userSubscriptions.findFirst({
    where: {
      UserID: userId,
      Status: 'active'
    }
  });

  if (existingActiveSubscription) {
    throw new Error('User already has an active subscription');
  }

  // Create the new subscription record
  const subscription = await prisma.userSubscriptions.create({
    data: {
      UserID: userId,
      SubscriptionPlanID: subscriptionPlanId,
      StartDate: startDate,
      EndDate: endDate,
      Status: 'pending',
      StripeSessionId: stripeSessionId
    }
  });

  return subscription;
};

// Function to calculate the end date based on the start date
const calculateEndDate = (startDate) => {
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1); // Add 12 months (1 year) to start date
  return endDate;
};

// Function to update subscription status
const updateSubscriptionStatus = async (userId, subscriptionPlanId, status) => {
  // Convert userId and subscriptionPlanId to integers
  const userIdInt = parseInt(userId, 10);
  const subscriptionPlanIdInt = parseInt(subscriptionPlanId, 10);

  try {
    await prisma.userSubscriptions.updateMany({
      where: {
        UserID: userIdInt, // Use integer value
        SubscriptionPlanID: subscriptionPlanIdInt, // Use integer value
        Status: 'pending'
      },
      data: {
        Status: status
      }
    });
    console.log(`Updated subscription status for user ${userIdInt} and plan ${subscriptionPlanIdInt}`);
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error; // Rethrow error to handle it in the webhook controller
  }
};

// Function to get subscription plan details by ID
async function getUserSubscriptionPlanById(subscriptionPlanId) {
  try {
    return await prisma.subscriptionPlans.findUnique({
      where: { idSubscriptionPlans: subscriptionPlanId },
      select: {
        Price: true,
        Name: true,
        Features: true
      }
    });
  } catch (error) {
    console.error('Error fetching subscription plan:', error.message);
    throw new Error('Failed to fetch subscription plan');
  }
}

module.exports = { createSubscription, updateSubscriptionStatus, getUserSubscriptionPlanById };
