import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { Tabs, Tab } from '@nextui-org/react';
import { AddCar } from '../AddCar';
export const Cars = ({ userData }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('add-car');

  useEffect(() => {
    if (pathname === '/UserDashboard/Cars') {
      setSelectedTab('add-car');
    }
  }, [pathname]);

  // Handle tab change and navigate to the appropriate route
  const handleTabChange = (key) => {
    setSelectedTab(key);
    navigate(`/UserDashboard/Cars/${key}`);
  };

  return (
    <div className='flex flex-1 h-full'>
      <div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full'>
        <div className='flex w-full flex-col'>
          <Tabs
            selectedKey={selectedTab}
            variant='bordered'
            className='justify-center mb-6'
            aria-label='Cars Management Tabs'
            onSelectionChange={handleTabChange}
          >
            <Tab key='add-car' as={Link} to='' title='Add Car' />
            <Tab key='edit-cars' as={Link} to='edit-cars' title='Edit Cars' />
          </Tabs>

          <Routes>
            <Route path='/' element={<AddCar userData={userData} />} />
            <Route path='edit-cars' element={<div></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
