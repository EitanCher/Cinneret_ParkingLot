import React from 'react';
import { useTheme } from '../Context/ThemeContext'; // Import useTheme from your ThemeContext

const HowItWorks = () => {
  return (
    <div className='flex flex-col gap-10 px-4 py-10'>
      <div className='flex flex-col gap-4 md:pr-44'>
        <h1 className='text-[#111118] dark:text-[#f7fafc] text-1xl font-bold font-sans leading-tight md:text-4xl md:font-black md:leading-tight'>
          How it works
        </h1>
        <p className='text-[#111118] dark:text-[#e2e8f0] text-base font-normal leading-normal md:text-lg'>
          ParkNow is a parking payment system that allows users to pay for parking from their phone. Users can also use the app to find parking spaces
          at participating locations and get real-time updates on parking availability. The system uses GPS technology to detect when a user has
          parked their car and automatically starts a parking session. Users can also enter the zone number displayed on the parking meter to start a
          session manually. Once a parking session is started, users can add more time to their session if needed. When a parking session is active,
          the app displays the time remaining and sends push notifications when the session is about to expire.
        </p>
      </div>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3'>
        <div className='flex flex-col gap-3 pb-3'>
          <div
            className='w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl'
            style={{
              backgroundImage: 'url("https://cdn.usegalileo.ai/stability/51a70205-5a27-4d53-93d6-ff5475b7f53e.png")',
              backgroundSize: 'cover'
            }}
          ></div>
          <div>
            <p className='text-[#111118] dark:text-[#e2e8f0] text-base font-sans font-medium leading-normal'>Choose a parking lot</p>
            <p className='text-[#636388] dark:text-[#a0aec0] text-sm font-normal leading-normal'>
              Our parking lots are spread throughout the entire country. Pick the closest one to you.
            </p>
          </div>
        </div>
        <div className='flex flex-col gap-3 pb-3'>
          <div
            className='w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl'
            style={{
              backgroundImage: 'url("https://cdn.usegalileo.ai/stability/60abdea9-9209-47d8-a005-edde3a945e1e.png")',
              backgroundSize: 'cover'
            }}
          ></div>
          <div>
            <p className='text-[#111118] dark:text-[#e2e8f0] text-base font-medium leading-normal font-sans'>Reserve</p>
            <p className='text-[#636388] dark:text-[#a0aec0] text-sm font-normal leading-normal'>
              Use the app to book a parking spot in advance (optional).
            </p>
          </div>
        </div>
        <div className='flex flex-col gap-3 pb-3'>
          <div
            className='w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl'
            style={{
              backgroundImage: 'url("https://cdn.usegalileo.ai/stability/f50812e3-bfd9-48ea-8e60-195ee0219685.png")',
              backgroundSize: 'cover'
            }}
          ></div>
          <div>
            <p className='text-[#111118] dark:text-[#e2e8f0] text-base font-medium leading-normal font-sans'>Get updates</p>
            <p className='text-[#636388] dark:text-[#a0aec0] text-sm font-normal leading-normal'>
              Get real-time updates on parking availability and receive push notifications when your session is about to expire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
