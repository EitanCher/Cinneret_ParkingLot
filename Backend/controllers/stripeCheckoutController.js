// stripeController.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { createSubscription, getUserSubscriptionPlanById } = require('../models/subscriptionModel');

const createStripeSession = async (req, res) => {
  let { subscriptionPlanId } = req.body;
  userId = req.user.id;
  console.log('subscription plan id in stripe controller', subscriptionPlanId);
  console.log('user id in stripe controller', userId);
  console.log('secret key in stripe controller :', process.env.STRIPE_SECRET_KEY);
  subscriptionPlanId = subscriptionPlanId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Fetch subscription plan details
    console.log('fetching subscription plan details');
    const subscriptionPlan = await getUserSubscriptionPlanById(subscriptionPlanId);

    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription Plan not found' });
    }

    const featuresDescription = subscriptionPlan.Features.join(', ');
    const unitAmount = subscriptionPlan.Price * 100; // Convert price to cents for Stripe
    let img = '';
    switch (subscriptionPlanId) {
      case 1:
        img = `https://images.pexels.com/photos/3095713/pexels-photo-3095713.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`; // Example for plan 1
        break;
      case 2:
        img = `https://images.pexels.com/photos/842794/pexels-photo-842794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`; // Example for plan 2
        break;
      default:
        img = `https://images.pexels.com/photos/23729986/pexels-photo-23729986/free-photo-of-concrete-real-estate-district.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`; // Default image
    }
    console.log('img is:', img);
    // Create a Stripe Checkout Session
    console.log('creating stripe checkout session-stripe.checkout.sessions.create ');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: subscriptionPlan.Name,
              description: `Subscription plan with features: ${featuresDescription}`,
              images: [img] // Replace with your image URL
            },
            unit_amount: unitAmount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        userId,
        subscriptionPlanId
      }
    });

    console.log('about to enter create subscription in model');
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
