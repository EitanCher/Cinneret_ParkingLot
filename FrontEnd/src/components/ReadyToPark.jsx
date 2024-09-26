import React from 'react';

const ReadyToPark = () => {
  return (
    <div className='relative'>
      <div className='font-sans px-4 py-10 md:px-10'>
        <div className='flex flex-col items-center justify-center gap-6 py-10'>
          <div className='flex flex-col items-center gap-4 text-center'>
            <h1 className='text-[#111118] dark:text-[#e2e8f0] text-2xl font-bold leading-tight md:text-4xl md:font-black md:leading-tight'>
              Ready to park?
            </h1>
            {/* Corrected the className for dark mode */}
            <p className='text-[#111118] dark:text-[#e2e8f0] text-base font-normal leading-normal md:text-lg'>
              Get started with ParkNow today and enjoy the convenience of smart parking. Download our app and start parking smarter.
            </p>
          </div>
          <button className='flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1919e6] text-white text-sm font-bold leading-normal tracking-[0.015em] md:h-12 md:px-5'>
            <span className='truncate'>Download the app</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadyToPark;
