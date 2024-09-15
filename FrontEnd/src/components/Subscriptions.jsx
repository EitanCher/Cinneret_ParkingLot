import React, { useState, useEffect } from 'react';
import { Button, Spinner, Card, CardBody } from '@nextui-org/react';
import subscriptionsImg from '../assets/images/Subscriptions.jpg'; // Corrected the import name
import { fetchSubscriptions, fetchStripeSessionID, getUserSubscription } from '../api/userApi'; // Ensure correct import
import { GoCheck } from 'react-icons/go';
import { useAuth } from '../Context/AuthContext'; // Use your AuthContext
import { useTheme } from '../Context/ThemeContext'; // Import useTheme
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe

// Initialize Stripe outside of a component’s render to avoid recreating the instance on every render
const stripePromise = loadStripe('pk_test_51PgRliRsSJ7763042IP7ZOzW1T0sizlOQy5xGFVI1n8YlIw14H0WRaFuOE8TIff1ZDvnua1gzOnaDgAPCs878dIZ0071SqcAkO'); // Replace with your actual publishable key

const Subscriptions = () => {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme(); // Add this line to get the dark mode state
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSubscriptionID, setUserSubscriptionID] = useState(null);

  const handleSubscribe = async (subscriptionPlanId) => {
    try {
      console.log('Subscription plan in Subscriptions.jsx:', subscriptionPlanId);

      // Fetch session ID from the backend
      const sessionId = await fetchStripeSessionID(subscriptionPlanId);

      console.log('Session ID in Subscriptions.jsx:', sessionId);

      if (!sessionId) {
        setError('Failed to get checkout session. Please try again.');
        return;
      }

      // Initialize Stripe with your publishable key
      const stripe = await stripePromise;

      if (!stripe) {
        setError('Stripe failed to initialize.');
        return;
      }

      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe Checkout error:', error);
        setError('An error occurred during checkout. Please try again.');
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      setError('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const getSubscriptions = async () => {
      try {
        const data = await fetchSubscriptions();
        console.log('Fetched subscriptions data:', data);

        if (Array.isArray(data)) {
          setSubscriptions(data);
        } else {
          console.error('Fetched data is not an array:', data);
          setError('Data format error');
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
        setError('Failed to fetch subscriptions');
      } finally {
        setLoading(false);
      }
    };

    const getUserActiveSubscription = async () => {
      try {
        const response = await getUserSubscription(); // Assuming getUserSubscription returns a response
        console.log('response in subscriptions.jsx', response);
        if (response) {
          console.log('Current plan:', response.SubscriptionPlanID);
          setUserSubscriptionID(response.SubscriptionPlanID);
        } else {
          console.log('No active subscription found');
        }
      } catch (error) {
        console.error('Failed to get user subscription:', error);
        setError('Failed to get user subscription');
      }
    };

    if (isAuthenticated) getUserActiveSubscription();
    getSubscriptions();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className='p-4 flex justify-center items-center'>
        <Spinner size='lg' label='Loading subscriptions...' color='primary' />
      </div>
    );
  }

  if (error) {
    return <p className='text-red-500 text-center'>{error}</p>;
  }

  return (
    <div className='relative '>
      <div className='p-4 md:p-4'>
        <div
          className='flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 md:px-10 pb-10'
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${subscriptionsImg})`
          }}
        >
          <div className='flex flex-col gap-2 text-left font-sans'>
            <h1 className=' text-[#f7fafc] -4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:leading-tight md:tracking-[-0.033em]'>
              Get the most out of your parking with ParkNow
            </h1>
            <h2 className='text text-sm font-normal leading-normal md:text-base'>
              Choose the Plan that's right for you, and start parking smarter today
            </h2>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto px-4'>
        {subscriptions.map((sub, index) => (
          <Card
            key={index}
            isFooterBlurred
            radius='lg'
            className={`card border-none ${isDarkMode ? 'bg-card-bg text-card-text border-card-border' : 'bg-white text-gray-900'}`}
            shadow={isDarkMode ? 'card' : 'sm'} // Apply the custom shadow if dark mode
          >
            <CardBody className='p-6'>
              <h1 className='text-base font-bold leading-tight'>{sub.Name}</h1>
              <p className='py-3 flex items-baseline gap-1'>
                <span className='text-4xl font-black leading-tight tracking-[-0.033em]'>{`$` + sub.Price} </span>
                <span className='text-base font-bold leading-tight'>/Year</span>
              </p>
              <Button
                onClick={() => handleSubscribe(sub.idSubscriptionPlans)}
                color={userSubscriptionID === sub.idSubscriptionPlans ? 'danger' : 'primary'}
                isDisabled={userSubscriptionID === sub.idSubscriptionPlans || (isAuthenticated && sub.idSubscriptionPlans < userSubscriptionID)}
              >
                {userSubscriptionID === sub.idSubscriptionPlans
                  ? 'Active'
                  : isAuthenticated && sub.idSubscriptionPlans > userSubscriptionID
                  ? 'Upgrade'
                  : 'Subscribe'}
              </Button>
              {sub.Features && sub.Features.length > 0 && (
                <ul className='list-disc mt-4'>
                  {sub.Features.map((feature, i) => (
                    <li key={i} className='flex items-center'>
                      <GoCheck className='w-5 h-5 mr-2' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
