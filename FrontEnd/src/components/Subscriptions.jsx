import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import subscriptionsImg from '../assets/images/Subscriptions.jpg';
import { fetchSubscriptions, fetchStripeSessionID, getUserSubscription } from '../api/userApi';
import { GoCheck } from 'react-icons/go';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51PgRliRsSJ7763042IP7ZOzW1T0sizlOQy5xGFVI1n8YlIw14H0WRaFuOE8TIff1ZDvnua1gzOnaDgAPCs878dIZ0071SqcAkO');

const Subscriptions = () => {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSubscriptionID, setUserSubscriptionID] = useState(null);

  const handleSubscribe = async (subscriptionPlanId) => {
    try {
      const sessionId = await fetchStripeSessionID(subscriptionPlanId);
      if (!sessionId) {
        setError('Failed to get checkout session. Please try again.');
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        setError('Stripe failed to initialize.');
        return;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        setError('An error occurred during checkout. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const getSubscriptions = async () => {
      try {
        const data = await fetchSubscriptions();
        if (Array.isArray(data)) {
          setSubscriptions(data);
        } else {
          setError('Data format error');
        }
      } catch (error) {
        setError('Failed to fetch subscriptions');
      } finally {
        setLoading(false);
      }
    };

    const getUserActiveSubscription = async () => {
      try {
        const response = await getUserSubscription();
        if (response) {
          setUserSubscriptionID(response.SubscriptionPlanID);
        }
      } catch (error) {
        setError('Failed to get user subscription');
      }
    };

    if (isAuthenticated) getUserActiveSubscription();
    getSubscriptions();
  }, [isAuthenticated]);

  if (loading) {
    // Show loading placeholders while loading data
    return (
      <div className='relative'>
        <div className='p-4 md:p-4'>
          <div
            className='flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 md:px-10 pb-10 animate-pulse'
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${subscriptionsImg})`
            }}
          >
            <div className='flex flex-col gap-2 text-left font-sans'>
              <div className='h-8 bg-gray-300 rounded-md dark:bg-gray-700 w-3/4'></div>
              <div className='h-4 bg-gray-300 rounded-md dark:bg-gray-700 w-1/2'></div>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto px-4'>
          {[1, 2, 3].map((_, index) => (
            <div key={index} className='p-4 animate-pulse'>
              <div className='h-48 bg-gray-300 rounded-md dark:bg-gray-700'></div>
              <div className='mt-4 h-6 bg-gray-300 rounded-md dark:bg-gray-700'></div>
              <div className='mt-2 h-4 bg-gray-300 rounded-md dark:bg-gray-700'></div>
              <div className='mt-4 h-10 w-32 bg-gray-300 rounded-md dark:bg-gray-700'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className='text-red-500 text-center'>{error}</p>;
  }

  return (
    <div className='relative'>
      <div className='p-4 md:p-4'>
        <div
          className='flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 md:px-10 pb-10'
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${subscriptionsImg})`
          }}
        >
          <div className='flex flex-col gap-2 text-left font-sans'>
            <h1 className='text-[#f7fafc] text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:leading-tight'>
              Get the most out of your parking with ParkNow
            </h1>
            <h2 className='text-[#f7fafc] text-sm font-normal leading-normal md:text-base'>
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
            shadow={isDarkMode ? 'card' : 'sm'}
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
