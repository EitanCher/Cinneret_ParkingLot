// stripeController.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { createSubscription, getUserSubscriptionPlanById } = require('../models/subscriptionModel');

const createStripeSession = async (req, res) => {
  let { userId, subscriptionPlanId } = req.body;

  // Sanitization
  userId = req.user.idUsers;
  subscriptionPlanId = subscriptionPlanId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Fetch subscription plan details
    const subscriptionPlan = await getUserSubscriptionPlanById(subscriptionPlanId);

    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription Plan not found' });
    }

    const featuresDescription = subscriptionPlan.Features.join(', ');
    const unitAmount = subscriptionPlan.Price * 100; // Convert price to cents for Stripe

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: subscriptionPlan.Name,
              description: `Subscription plan with features: ${featuresDescription}`,
              images: ['https://example.com/subscription-plan-image.jpg'] // Replace with your image URL
            },
            unit_amount: unitAmount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `https://httpbin.org/get?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://httpbin.org/get`,
      metadata: {
        userId,
        subscriptionPlanId
      }
    });

    // Save the Stripe session ID into the database
    const subscription = await createSubscription({
      userId,
      subscriptionPlanId,
      stripeSessionId: session.id
    });
    console.log(`Stripe session created successfully with ID ${session.id}`);

    // Send the session ID to the client
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating Stripe Checkout session:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createStripeSession };
