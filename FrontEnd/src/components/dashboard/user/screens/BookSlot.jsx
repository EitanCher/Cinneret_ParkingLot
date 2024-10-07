import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChooseParkingLot } from '../../admin/ChooseParkingLot';
import ReservationCard from '../ReservationCard';
import { ReservationView } from '../ReservationView';
import { UpcomingReservations } from '../UpcomingReservations'; // Import the new component
import { checkReservation } from '../../../../api/userApi';

export const BookSlot = ({ userData }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cityName } = useParams();
  const [selectedCity, setSelectedCity] = useState(null);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const checkReservations = async () => {
      try {
        const result = await checkReservation();
        console.log('Reservations from API:', result);

        // If no reservations, set the state to an empty array
        if (result.status === 'no reservations') {
          setReservations([]);
        } else {
          // Store all reservations returned by the backend
          setReservations(result.reservations);
        }
      } catch (error) {
        console.error('Error checking reservations:', error);
      }
    };

    if (pathname === '/UserDashboard') {
      setSelectedCity(null);
    } else if (cityName) {
      setSelectedCity({ CityName: cityName });
    }

    checkReservations();
  }, [pathname, cityName]);

  const handleCitySelection = (city) => {
    setSelectedCity(city);
    navigate(`/UserDashboard/${city.CityName}`);
  };

  const handleReservation = (car, date) => {
    console.log(`Reserved ${car} on ${date}`);
  };

  return (
    <div className='flex flex-1 h-full'>
      <div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full'>
        <div className='flex w-full flex-col'>
          <Routes>
            <Route
              path='/'
              element={
                <div className='flex flex-col items-center'>
                  <ChooseParkingLot setSelectedCity={handleCitySelection} />
                  {reservations.length > 0 && (
                    <>
                      <ReservationView
                        key={reservations[0].idReservation}
                        reservationsNum={reservations.length}
                        reservation={reservations[0]}
                        setReservations={setReservations}
                      />
                      {reservations.length > 1 && <UpcomingReservations setReservations={setReservations} reservations={reservations} />}
                    </>
                  )}
                </div>
              }
            />
          </Routes>
          {selectedCity && <ReservationCard selectedCity={selectedCity} userData={userData} onReserve={handleReservation} />}
        </div>
      </div>
    </div>
  );
};
