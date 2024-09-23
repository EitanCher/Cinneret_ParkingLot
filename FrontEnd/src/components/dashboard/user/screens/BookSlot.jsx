import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChooseParkingLot } from '../../admin/ChooseParkingLot';
import ReservationCard from '../ReservationCard'; // Ensure the path is correct

export const BookSlot = ({ userData }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cityName } = useParams(); // Get the city name from the URL
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    // Reset selectedCity if navigating away from the BookSlot
    if (pathname === '/UserDashboard') {
      setSelectedCity(null);
    } else if (cityName) {
      // Assuming you have a way to get the city object by name
      setSelectedCity({ CityName: cityName }); // Simplified example
    }
  }, [pathname, cityName]);

  const handleCitySelection = (city) => {
    setSelectedCity(city);
    navigate(`/UserDashboard/${city.CityName}/book`); // Update URL with selected city
  };

  const handleReservation = (car, date) => {
    console.log(`Reserved ${car} on ${date}`);
  };

  return (
    <div className='flex flex-1 h-full'>
      <div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full'>
        <div className='flex w-full flex-col'>
          <Routes>
            <Route path='/' element={<ChooseParkingLot setSelectedCity={handleCitySelection} />} />
          </Routes>
          {selectedCity && <ReservationCard selectedCity={selectedCity} userData={userData} onReserve={handleReservation} />}
        </div>
      </div>
    </div>
  );
};
