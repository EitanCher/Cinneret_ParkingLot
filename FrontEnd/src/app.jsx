import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './index.css'; // Ensure this file does not override dark mode styles
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import ReadyToPark from './components/ReadyToPark';
import Cities from './components/Cities';
import Subscriptions from './components/Subscriptions';
import Login from './components/Login';
import AuthProvider from './Context/authContext';
import SignUp from './components/SignUp';
import { useTheme } from './Context/ThemeContext';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import UserDashboard from './components/dashboard/user/UserDashboard';

const App = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();

  const containerClass =
    location.pathname.startsWith('/AdminDashboard') || location.pathname.startsWith('/UserDashboard') ? 'w-full' : 'max-w-[960px]';
  const paddingClass = location.pathname.startsWith('/AdminDashboard') || location.pathname.startsWith('/UserDashboard') ? 'p-0' : 'px-4 py-5';

  return (
    <AuthProvider>
      <div
        className={`relative flex min-h-screen flex-col overflow-x-hidden ${
          isDarkMode ? 'dark bg-dark-bg text-dark-text ' : 'bg-white text-gray-900 '
        }`}
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <Header />
        <div className={`flex flex-1 justify-center ${paddingClass}`}>
          <div className={`layout-content-container flex flex-col flex-1 ${containerClass}`}>
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
              <Route path='/UserDashboard/*' element={<UserDashboard />} />
              <Route path='/AdminDashboard/*' element={<AdminDashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;
