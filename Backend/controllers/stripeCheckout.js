const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Replace with your Stripe secret key
const prisma = require('../prisma/prismaClient');

const handleCheckoutSession = async (req, res) => {
  const { idSubscriptionPlans, idUsers } = req.body;
  console.log('idUsers in stripeController: ' + idUsers);

  try {
    // Fetch subscription plan details including features
    const subscriptionPlan = await prisma.subscriptionPlans.findUnique({
      where: { idSubscriptionPlans: idSubscriptionPlans },
      select: {
        Price: true,
        Name: true,
        Features: true // Assuming Features is an array of strings or a text field
      }
    });

    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription Plan not found' });
    }

    // Log subscription plan details
    console.log('Subscription Plan:', subscriptionPlan);

    // Format the features into a description
    const featuresDescription = subscriptionPlan.Features.join(', '); // Join array items with commas

    // Calculate unit amount in cents
    const unitAmount = subscriptionPlan.Price * 100;
    console.log(`Unit Amount (in cents): ${unitAmount}`);

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${subscriptionPlan.Name}`,
              description: `Monthly subscription plan with features: ${featuresDescription}`, // Include features in the description
              images: ['https://example.com/subscription-plan-image.jpg']
            },
            unit_amount: unitAmount // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: 'https://httpbin.org/get',
      cancel_url: 'https://httpbin.org/status/400',

      // success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        subscriptionPlanId: idSubscriptionPlans,
        idUsers: idUsers
      }
    });

    // Save the Stripe session ID into the database
    await prisma.userSubscriptions.updateMany({
      where: {
        UserID: idUsers,
        Status: 'pending' // Ensure you're updating the correct subscription
      },
      data: {
        StripeSessionId: session.id
      }
    });

    // Send the session ID to the client
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating Stripe Checkout session:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { handleCheckoutSession };
