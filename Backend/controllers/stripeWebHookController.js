const stripe = require('../config/stripe'); // Import Stripe instance
const prisma = require('../prisma/prismaClient'); // Import Prisma client

const handleStripeWebhook = async (req, res) => {
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET; // Your Stripe endpoint secret
  const sig = req.headers['stripe-signature']; // Signature from Stripe header

  let event;

  // Verify and parse the event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Retrieve subscription plan ID from metadata
    const subscriptionPlanId = session.metadata.subscriptionPlanId;

    try {
      // Example: Update or create a subscription in the database
      await prisma.userSubscriptions.create({
        data: {
          userId: 'user-id', // Replace with actual user ID from your app logic
          subscriptionPlanId: subscriptionPlanId
          // Additional subscription details
        }
      });

      console.log('Subscription created successfully');
    } catch (error) {
      console.error('Error handling checkout.session.completed event:', error.message);
      return res.status(500).send('Internal Server Error');
    }
  }

  // Respond to acknowledge receipt of the event
  res.json({ received: true });
};

module.exports = { handleStripeWebhook };
