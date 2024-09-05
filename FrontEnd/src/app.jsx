import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import ReadyToPark from './components/ReadyToPark';

const App = () => {
  return (
    <div
      className='relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden'
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <Header />
      <div className='px-4 flex flex-1 justify-center py-5'>
        <div className='layout-content-container flex flex-col max-w-[960px] flex-1'>
          <HeroSection />
          <HowItWorks />
          <ReadyToPark />
        </div>
      </div>
    </div>
  );
};

export default App;
