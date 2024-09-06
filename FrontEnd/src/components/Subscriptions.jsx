import React, { useState, useEffect } from 'react';
import { Button, Spinner, Card, Image, CardFooter, CardBody } from '@nextui-org/react';
import subscriptionsImg from '../assets/images/Subscriptions.jpg'; // Corrected the import name
import { fetchSubscriptions } from '../api/userApi'; // Ensure correct import
import { GoCheck } from 'react-icons/go';
import { Link } from 'react-router-dom'; // Import useLocation from react-router-dom

import test from '../assets/images/test.jpg';
const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSubscriptions = async () => {
      try {
        const data = await fetchSubscriptions();
        console.log('Fetched subscriptions data:', data);

        // Set the fetched data directly, assuming it's an array
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
    getSubscriptions();
  }, []);

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
    <div className='relative'>
      <div className='p-4 md:p-4'>
        <div
          className='flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 md:px-10 pb-10'
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${subscriptionsImg})`
          }}
        >
          <div className='flex flex-col gap-2 text-left font-sans'>
            <h1 className='text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:leading-tight md:tracking-[-0.033em]'>
              Get the most out of your parking with ParkNow
            </h1>
            <h2 className='text-white text-sm font-normal leading-normal md:text-base'>
              Choose the Plan that's right for you, and start parking smarter today
            </h2>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto'>
        {subscriptions.map((sub, index) => (
          <Card isFooterBlurred radius='lg' className='border-none' shadow='sm' key={index}>
            <CardBody className='p-6'>
              <h1 class='text-[#0e0e1b] text-base font-bold leading-tight'>{sub.Name}</h1>
              <p class='py-3 flex items-baseline gap-1 text-[#0e0e1b]'>
                <span className='text-[#0e0e1b] text-4xl font-black leading-tight tracking-[-0.033em]'>{`$` + sub.Price} </span>
                <span className='text-[#0e0e1b] text-base font-bold leading-tight'>/Year</span>
              </p>
              <Button as={Link} to={'/signup/' + sub.Name} color='primary'>
                Button
              </Button>
              {sub.Features && sub.Features.length > 0 && (
                <ul className='list-disc  mt-4'>
                  {sub.Features.map((feature, i) => (
                    <li key={i} className='flex items-center text-[#0e0e1b]'>
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
