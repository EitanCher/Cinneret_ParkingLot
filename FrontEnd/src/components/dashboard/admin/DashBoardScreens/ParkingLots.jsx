import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Outlet, Link, useNavigate } from 'react-router-dom';
import { Tabs, Tab } from '@nextui-org/react';
import { AddParkingLot } from '../AddParkingLot';
import { ChooseParkingLot } from '../ChooseParkingLot';
import { ParkingLotsGeneral } from '../DashBoardScreens/ParkingLotsGeneral';
export const ParkingLots = () => {
  const { pathname } = useLocation(); // Get the current path
  const navigate = useNavigate(); // Hook to programmatically navigate
  const [selectedTab, setSelectedTab] = useState('add-parking-lot');
  const [selectedCity, setSelectedCity] = useState(null);

  // Update selected tab based on the current pathname
  useEffect(() => {
    if (pathname === '/AdminDashboard/ParkingLots') {
      setSelectedTab('add-parking-lot');
      setSelectedCity(null); // Reset selected city when returning to ParkingLots
    }
  }, [pathname]);

  // Update selected city and navigate to the general route
  const handleCitySelection = (city) => {
    setSelectedCity(city);
    setSelectedTab('general'); // Set the default tab when a city is chosen
    navigate('general'); // Navigate to the General route
  };

  return (
    <div className='flex flex-1 h-full'>
      <div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full'>
        <div className='flex w-full flex-col'>
          {selectedCity ? (
            <Tabs
              selectedKey={selectedTab}
              variant='bordered'
              className='justify-center mb-6'
              aria-label='Parking Lot Details Tabs'
              onSelectionChange={setSelectedTab}
            >
              <Tab key='general' as={Link} to='general' title='General' />
              <Tab key='areas' as={Link} to='areas' title='Areas' />
              <Tab key='slots' as={Link} to='slots' title='Slots' />
              <Tab key='gates' as={Link} to='gates' title='Gates' />
            </Tabs>
          ) : (
            <Tabs
              selectedKey={selectedTab}
              variant='bordered'
              className='justify-center mb-6'
              aria-label='Parking Lots Tabs'
              onSelectionChange={setSelectedTab}
            >
              <Tab key='add-parking-lot' as={Link} to='' title='Add Parking Lot' />
              <Tab key='choose-parking-lot' as={Link} to='choose-parking-lot' title='Choose Parking Lot' />
            </Tabs>
          )}

          <Routes>
            <Route path='/' element={<AddParkingLot />} />
            <Route path='add-parking-lot' element={<AddParkingLot />} />
            <Route path='choose-parking-lot' element={<ChooseParkingLot setSelectedCity={handleCitySelection} />} />
            {selectedCity && (
              <>
                <Route path='general' element={<ParkingLotsGeneral selectedCity={selectedCity} />} />
                <Route path='areas' element={<div>Areas in {selectedCity.idCities}</div>} />
                <Route path='slots' element={<div>Slots in {selectedCity.idCities}</div>} />
                <Route path='gates' element={<div>Gates in {selectedCity.idCities}</div>} />
              </>
            )}
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
