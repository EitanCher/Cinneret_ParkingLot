// const Stripe = require('stripe');
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// const { updateSubscriptionStatus } = require('../models/subscriptionModel');

// const handleCheckoutSessionCompleted = async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

//   let event;

//   try {
//     // Stripe expects the raw body as a Buffer
//     const body = req.body;
//     console.log('req.body in webhook controller', req.body);
//     console.log('Received webhook event:', body);

//     // Construct the event from the raw body
//     event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
//     console.log('Successfully verified webhook event');
//   } catch (err) {
//     console.error('Webhook Error:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   if (event.type === 'checkout.session.completed') {
//     console.log('entered checkout.session.completed if statement');
//     const session = event.data.object;

//     // Extract and sanitize metadata
//     console.log('extractic userID and subscriptionPlanId from metadata');
//     const userId = session.metadata.userId;
//     const prevSubscriptionPlanID = session.metadata.prevSubscriptionPlanID;
//     const subscriptionPlanIdForCheckout = session.metadata.subscriptionPlanIdForCheckout;
//     console.log('subscriptionPlanIdForCheckout in webhook: ' + subscriptionPlanIdForCheckout);

//     if (!userId || !subscriptionPlanIdForCheckout) {
//       console.error('Missing metadata fields in the session:', session.metadata);
//       return res.status(400).send('Missing metadata fields');
//     }

//     try {
//       console.log(`Updating subscription status for user ${userId} and subscription plan ${subscriptionPlanIdForCheckout}`);
//       // Update the subscription status to 'active'
//       await updateSubscriptionStatus(userId, prevSubscriptionPlanID, subscriptionPlanIdForCheckout, 'active');
//       console.log(`Subscription ${subscriptionPlanIdForCheckout} for user ${userId} is now active.`);
//     } catch (err) {
//       console.error('Error updating subscription status:', err.message);
//       return res.status(500).send('Internal Server Error');
//     }
//   } else {
//     console.log(`Unhandled event type ${event.type}`);
//   }

//   // Respond to Stripe that the webhook was received
//   res.status(200).json({ received: true });
// };

// module.exports = { handleCheckoutSessionCompleted };
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
    console.log('req.rawBody in webhook controller:', body);

    // Construct the event from the raw body
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log('Successfully verified webhook event');
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Full session object:', session);

      const subscriptionId = session.subscription; // Stripe subscription ID

      if (!subscriptionId) {
        console.error('Missing subscription ID');
        return res.status(400).send('Missing subscription ID');
      }

      try {
        // Retrieve the subscription object from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log('Subscription object:', subscription);

        // Extract metadata
        const userId = subscription.metadata.userId;
        const prevSubscriptionPlanID = subscription.metadata.prevSubscriptionPlanID;
        const subscriptionPlanIdForCheckout = subscription.metadata.subscriptionPlanIdForCheckout;

        if (!userId || !prevSubscriptionPlanID || !subscriptionPlanIdForCheckout) {
          console.error('Missing metadata fields in the subscription:', subscription.metadata);
          return res.status(400).send('Missing metadata fields');
        }

        console.log(`Updating subscription status for user ${userId} and subscription plan ${subscriptionPlanIdForCheckout}`);
        // Update the subscription status to 'active'
        await updateSubscriptionStatus(userId, prevSubscriptionPlanID, subscriptionPlanIdForCheckout, 'active', subscriptionId);
        console.log(`Subscription ${subscriptionPlanIdForCheckout} for user ${userId} is now active.`);
      } catch (err) {
        console.error('Error retrieving subscription or updating status:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      break;

    case 'customer.subscription.deleted':
      console.log('Handling customer.subscription.deleted event');
      const canceledSubscription = event.data.object;

      // Extract metadata and subscriptionId
      const canceledUserId = canceledSubscription.metadata.userId;
      const canceledSubscriptionPlanId = canceledSubscription.metadata.subscriptionPlanIdForCheckout;

      if (!canceledUserId || !canceledSubscriptionPlanId) {
        console.error('Missing metadata fields in the subscription:', canceledSubscription.metadata);
        return res.status(400).send('Missing metadata fields');
      }

      try {
        console.log(`Updating subscription status for canceled subscription ${canceledSubscriptionPlanId} for user ${canceledUserId}`);
        // Update the subscription status to 'canceled'
        await updateSubscriptionStatus(canceledUserId, null, canceledSubscriptionPlanId, 'canceled');
        console.log(`Subscription ${canceledSubscriptionPlanId} for user ${canceledUserId} is now canceled.`);
      } catch (err) {
        console.error('Error updating subscription status:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Respond to Stripe that the webhook was received
  res.status(200).json({ received: true });
};

module.exports = { handleCheckoutSessionCompleted };
