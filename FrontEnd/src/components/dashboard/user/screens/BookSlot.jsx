import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChooseParkingLot } from '../../admin/ChooseParkingLot';
import ReservationCard from '../ReservationCard'; // Ensure the path is correct

export const BookSlot = ({ userData }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cityName } = useParams(); // Get city name from URL
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    if (pathname === '/UserDashboard') {
      setSelectedCity(null);
    } else if (cityName) {
      setSelectedCity({ CityName: cityName }); // Set the selected city based on URL
    }
  }, [pathname, cityName]);

  const handleCitySelection = (city) => {
    setSelectedCity(city);
    navigate(`/UserDashboard/${city.CityName}/book`); // Use city.CityName instead
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
            <Route path='/:cityName' element={<ChooseParkingLot setSelectedCity={handleCitySelection} />} /> {/* Add this line */}
          </Routes>
          {selectedCity && <ReservationCard selectedCity={selectedCity} userData={userData} onReserve={handleReservation} />}
        </div>
      </div>
    </div>
  );
};
