import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, Routes, Route } from 'react-router-dom';
import { Tabs, Tab } from '@nextui-org/react';
import { AddCar } from '../AddCar'; // Component for adding cars
import { EditCars } from '../EditCars'; // Component for editing cars

export const Cars = () => {
  const location = useLocation(); // Get the current path
  const navigate = useNavigate(); // Hook to navigate between tabs
  const [selectedTab, setSelectedTab] = useState('add-car'); // Default to the add-car tab

  // Update selectedTab based on pathname
  useEffect(() => {
    if (location.pathname.includes('edit-cars')) {
      setSelectedTab('edit-cars');
    } else {
      setSelectedTab('add-car');
    }
  }, [location.pathname]);

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
            <Tab key='add-car' title='Add Car' />
            <Tab key='edit-cars' title='Edit Cars' />
          </Tabs>

          <Routes>
            <Route path='add-car' element={<AddCar />} />
            <Route path='' element={<AddCar />} />
            <Route path='edit-cars' element={<EditCars />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
