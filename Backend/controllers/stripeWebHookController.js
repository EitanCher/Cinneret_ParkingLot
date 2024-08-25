const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { updateSubscriptionStatus } = require('../models/subscriptionModel');

const handleCheckoutSessionCompleted = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

  let event;

  try {
    // Stripe expects the raw body as a Buffer
    const body = req.body;
    console.log('Received webhook event:', body);

    // Construct the event from the raw body
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log('Successfully verified webhook event');
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    console.log('entered checkout.session.completed if statement');
    const session = event.data.object;

    // Extract and sanitize metadata
    console.log('extractic userID and subscriptionPlanId from metadata');
    const userId = session.metadata.userId;
    const subscriptionPlanId = session.metadata.subscriptionPlanId;

    if (!userId || !subscriptionPlanId) {
      console.error('Missing metadata fields in the session:', session.metadata);
      return res.status(400).send('Missing metadata fields');
    }

    try {
      console.log(`Updating subscription status for user ${userId} and subscription plan ${subscriptionPlanId}`);
      // Update the subscription status to 'active'
      await updateSubscriptionStatus(userId, subscriptionPlanId, 'active');
      console.log(`Subscription ${subscriptionPlanId} for user ${userId} is now active.`);
    } catch (err) {
      console.error('Error updating subscription status:', err.message);
      return res.status(500).send('Internal Server Error');
    }
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  // Respond to Stripe that the webhook was received
  res.status(200).json({ received: true });
};

module.exports = { handleCheckoutSessionCompleted };
