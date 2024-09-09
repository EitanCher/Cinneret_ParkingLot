// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import ReadyToPark from './components/ReadyToPark';
import Cities from './components/Cities';
import Subscriptions from './components/Subscriptions';
import Login from './components/Login';
import AuthProvider from './Context/authContext';
import SignUp from './components/SignUp';
import { useTheme } from './Context/ThemeContext'; // Your custom theme context

const App = () => {
  const { isDarkMode } = useTheme();

  return (
    <Router>
      <AuthProvider>
        <div
          className={`relative flex min-h-screen flex-col overflow-x-hidden ${isDarkMode ? 'dark' : ''}`}
          style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
          <Header />
          <div className='px-4 flex flex-1 justify-center py-5'>
            <div className='layout-content-container flex flex-col max-w-[960px] flex-1'>
              <Routes>
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
                <Route path='/cities' element={<Cities />} />
                <Route path='/subscriptions' element={<Subscriptions />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<SignUp />} />
              </Routes>
            </div>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
