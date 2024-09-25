import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { useAuth } from '../Context/authContext';
import backgroundImage8 from '../assets/images/HeroSection.jpg'; // Adjust the path as needed
import { IconBrandTabler } from '@tabler/icons-react';

const HeroSection = () => {
  const { isAuthenticated, user, loading } = useAuth(); // Get authentication status and loading state from context

  // Log user information (for debugging)
  useEffect(() => {
    console.log('User:', user);
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div className='relative'>
      <div className='p-4 md:p-4'>
        <div
          className='flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 md:px-10 pb-10'
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${backgroundImage8})`
          }}
        >
          <div className='flex flex-col gap-2 text-left font-sans'>
            <h1 className='text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:leading-tight md:tracking-[-0.033em]'>
              Welcome to ParkNow
            </h1>
            <h2 className='text-white text-sm font-normal leading-normal md:text-base'>
              The smarter way to park. Pay for parking on the go and receive reminders before time runs out. Extend your session without leaving your
              spot.
            </h2>
          </div>
          <div className='flex flex-wrap gap-3'>
            {!isAuthenticated ? (
              <>
                <Button as={Link} color='primary' to='/login' variant='shadow'>
                  Log In
                </Button>
                <Button as={Link} color='default' to='/subscriptions' variant='shadow'>
                  Sign Up
                </Button>
              </>
            ) : user.Role == 'admin' ? (
              <Button as={Link} color='primary' to='/AdminDashboard' variant='shadow'>
                <IconBrandTabler />
                Dashboard
              </Button>
            ) : (
              <Button as={Link} color='primary' to='/UserDashboard' variant='shadow'>
                <IconBrandTabler />
                Park Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
