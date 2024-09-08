import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import ReadyToPark from './components/ReadyToPark';
import Cities from './components/Cities';
import Subscriptions from './components/Subscriptions';
import Login from './components/Login';
import AuthProvider from './Context/authContext'; // Import your AuthProvider

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div
          className='relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden'
          style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
          <Header /> {/* Assuming Header handles navigation */}
          <div className='px-4 flex flex-1 justify-center py-5'>
            <div className='layout-content-container flex flex-col max-w-[960px] flex-1'>
              <Routes>
                {/* Home Route */}
                <Route
                  path='/'
                  element={
                    <>
                      <HeroSection />
                      <HowItWorks />
                      <ReadyToPark />
                    </>
                  }
                />

                {/* Cities Route */}
                <Route path='/cities' element={<Cities />} />

                {/* Subscriptions Route */}
                <Route path='/subscriptions' element={<Subscriptions />} />

                {/* Login Route */}
                <Route path='/login' element={<Login />} />
              </Routes>
            </div>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
