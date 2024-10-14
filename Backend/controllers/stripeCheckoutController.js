// stripeController.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const {
  createSubscription,
  getUserSubscriptionPlanById,
  checkExistingActiveSubscription,
  updateSubscriptionStatus
} = require('../models/subscriptionModel');

const cancelSubscription = async (req, res) => {
  const { subscriptionId } = req.body; // The Stripe subscription ID

  if (!subscriptionId) {
    return res.status(400).json({ error: 'Subscription ID is required' });
  }

  try {
    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log(subscription);

    // Debug log to inspect metadata
    console.log('Subscription metadata:', subscription.metadata);

    // Ensure metadata values are correctly retrieved and parsed
    const userId = parseInt(subscription.metadata.userId, 10);
    const prevSubscriptionPlanID = parseInt(subscription.metadata.prevSubscriptionPlanID, 10);
    const subscriptionPlanIdForCheckout = parseInt(subscription.metadata.subscriptionPlanIdForCheckout, 10);

    console.log('Subscription Plan ID for Checkout:', subscriptionPlanIdForCheckout);
    console.log('Previous Subscription Plan ID:', prevSubscriptionPlanID);

    if (isNaN(userId) || isNaN(prevSubscriptionPlanID) || isNaN(subscriptionPlanIdForCheckout)) {
      throw new Error('Invalid user ID or subscription plan IDs, must be numbers');
    }

    // Update the subscription to cancel at the end of the current period
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Optionally update your database to reflect this change
    await updateSubscriptionStatus(userId, prevSubscriptionPlanID, subscriptionPlanIdForCheckout, 'canceled', subscriptionId);

    res.json({ message: 'Subscription will not renew after the current period ends.', subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const createStripeSession = async (req, res) => {
  let { subscriptionPlanId } = req.body;
  const userId = req.user.id;
  let prevPlanID = subscriptionPlanId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const existingSubscription = await checkExistingActiveSubscription(userId);
    const subscriptionPlan = await getUserSubscriptionPlanById(subscriptionPlanId);
    console.log('subscription plan in stripe controller', subscriptionPlan);

    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription Plan not found' });
    }

    const priceId = subscriptionPlan.StripePriceId;
    let upgrade = false;
    let price = parseFloat(subscriptionPlan.Price);

    if (isNaN(price) || price <= 0) {
      throw new Error('Invalid subscription plan price');
    }

    if (existingSubscription) {
      const existingPrice = parseFloat(existingSubscription.Price);
      if (isNaN(existingPrice)) {
        throw new Error('Invalid existing subscription price');
      }

      if (existingPrice >= price) {
        throw new Error('Cannot subscribe to this plan anymore');
      } else {
        upgrade = true;
        price -= existingPrice;
        prevPlanID = existingSubscription.SubscriptionPlanID;
      }
    }

    console.log('Final price to pay is:', price);

    console.log('Creating Stripe Checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // Use the fetched price ID
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      subscription_data: {
        metadata: {
          userId: String(userId),
          prevSubscriptionPlanID: String(prevPlanID),
          subscriptionPlanIdForCheckout: String(subscriptionPlanId)
        }
      }
    });

    console.log('Stripe session created successfully with ID', session.id);

    console.log('subscriptionPlanIdForCheckout before calling createSubscription in model:', subscriptionPlanId);
    await createSubscription({
      userId,
      subscriptionPlanId: subscriptionPlanId,
      stripeSessionId: session.id,
      upgrade
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating Stripe Checkout session:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createStripeSession, cancelSubscription };
