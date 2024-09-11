const prisma = require('../prisma/prismaClient');
const { subscriptionSchema } = require('../db-postgres/zodSchema');
const { calculateEndDate, getCurrentISODate } = require('../utils/dateUtils');

// Function to create a subscription
const createSubscription = async ({ userId, subscriptionPlanId, stripeSessionId, upgrade }) => {
  const idUser = parseInt(userId, 10);
  const planId = parseInt(subscriptionPlanId, 10);

  console.log('subscription plan id in model:', planId);
  if (isNaN(planId)) {
    throw new Error('Invalid subscription plan ID, must be a number');
  }
  // Validate subscription data
  const subscriptionData = {
    SubscriptionPlanID: planId,
    StartDate: getCurrentISODate(),
    EndDate: calculateEndDate(new Date()),
    Status: 'pending'
  };

  try {
    subscriptionSchema.parse(subscriptionData); // Zod validation for subscription data
  } catch (error) {
    throw new Error('Validation error: ' + error.message);
  }

  // Fetch subscription plan details
  const subscriptionPlan = await prisma.subscriptionPlans.findUnique({
    where: { idSubscriptionPlans: planId },
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
      UserID: idUser,
      Status: 'pending'
    }
  });

  if (existingPendingSubscription) {
    // Update the existing pending subscription to active if there is a new subscription
    const updatedSubscription = await prisma.userSubscriptions.update({
      where: { idUserSubscriptions: existingPendingSubscription.idUserSubscriptions },
      data: {
        SubscriptionPlanID: planId,
        StripeSessionId: stripeSessionId,
        StartDate: new Date(),
        EndDate: calculateEndDate(new Date())
      }
    });

    return updatedSubscription;
  }
  if (upgrade === true) {
    // First, find the subscription ID based on UserID and Status
    const activeSubscription = await prisma.userSubscriptions.findUnique({
      where: {
        UserID_Status: {
          UserID: idUser,
          Status: 'active'
        }
      }
    });

    if (!activeSubscription) {
      throw new Error('Active subscription not found');
    }

    // Then, update the subscription
    const updatedSubscription = await prisma.userSubscriptions.update({
      where: {
        idUserSubscriptions: activeSubscription.idUserSubscriptions
      },
      data: {
        SubscriptionPlanID: subscriptionPlanId
      }
    });

    return updatedSubscription;
  }

  // Create the new subscription record
  const newSubscription = await prisma.userSubscriptions.create({
    data: {
      UserID: idUser,
      SubscriptionPlanID: planId,
      StartDate: new Date(),
      EndDate: calculateEndDate(new Date()),
      Status: 'pending',
      StripeSessionId: stripeSessionId
    }
  });

  return newSubscription;
};

const checkExistingActiveSubscription = async (userId) => {
  try {
    // Find the existing active subscription
    const existingSubscription = await prisma.userSubscriptions.findFirst({
      where: {
        UserID: parseInt(userId, 10),
        Status: 'active'
      },
      include: {
        SubscriptionPlans: {
          // Make sure this matches your schema
          select: {
            Price: true
          }
        }
      }
    });

    // If an active subscription is found, return the subscription object with price included
    if (existingSubscription && existingSubscription.SubscriptionPlans) {
      return {
        ...existingSubscription, // Spread the existing subscription data
        Price: existingSubscription.SubscriptionPlans.Price // Add the price field
      };
    } else {
      return null; // No active subscription found
    }
  } catch (err) {
    throw new Error('Error fetching existing active subscription: ' + err.message);
  }
};

// Function to update subscription status

const updateSubscriptionStatus = async (userId, prevSubscriptionPlanID, subscriptionPlanIdForCheckout, status) => {
  // Validate input data
  const userIdInt = parseInt(userId, 10);
  const prevSubscriptionPlanIdInt = parseInt(prevSubscriptionPlanID, 10);
  const subscriptionPlanIdForCheckoutInt = parseInt(subscriptionPlanIdForCheckout, 10);
  console.log('prev sub', prevSubscriptionPlanIdInt);
  console.log(' checkout sub', subscriptionPlanIdForCheckoutInt);
  if (isNaN(userIdInt, prevSubscriptionPlanIdInt, subscriptionPlanIdForCheckoutInt)) {
    throw new Error('Invalid user ID, must be a number');
  }
  const validStatuses = ['pending', 'active', 'expired'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  await prisma.userSubscriptions.updateMany({
    where: {
      UserID: userIdInt,
      SubscriptionPlanID: prevSubscriptionPlanIdInt,
      Status: 'pending'
    },
    data: {
      Status: status,
      SubscriptionPlanID: subscriptionPlanIdForCheckoutInt
    }
  });
};
// Function to get subscription plan details by ID
const getUserSubscriptionPlanById = async (subscriptionPlanId) => {
  // Validate input data
  const id = parseInt(subscriptionPlanId, 10);

  if (isNaN(id)) {
    throw new Error('Invalid subscription plan ID, must be a number');
  }

  return await prisma.subscriptionPlans.findUnique({
    where: { idSubscriptionPlans: id },
    select: {
      Price: true,
      Name: true,
      Features: true
    }
  });
};

const isValidStripeSessionId = (sessionId) => {
  // Implement Stripe session ID validation logic (e.g., check for proper format)
  return typeof sessionId === 'string' && sessionId.trim().length > 0;
};

module.exports = {
  createSubscription,
  updateSubscriptionStatus,
  getUserSubscriptionPlanById,
  checkExistingActiveSubscription
};
