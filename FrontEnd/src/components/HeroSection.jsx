import React from 'react';

const HeroSection = () => {
  return (
    <div className='relative'>
      <div className='p-4 md:p-4'>
        <div
          className='flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 md:px-10 pb-10'
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://cdn.usegalileo.ai/stability/c6dcf5ac-74d4-4a1a-b026-0b6d3516b783.png")'
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
            <button className='flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1919e6] text-white text-sm font-bold leading-normal tracking-[0.015em] md:h-12 md:px-5'>
              <span className='truncate'>Log in</span>
            </button>
            <button className='flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f0f0f4] text-[#111118] text-sm font-bold leading-normal tracking-[0.015em] md:h-12 md:px-5'>
              <span className='truncate'>Sign up</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
