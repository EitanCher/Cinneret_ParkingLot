import React, { useState, useEffect } from 'react';
import { Avatar } from '@nextui-org/react';
import { fetchCities } from '../../../api/userApi';

export const ChooseParkingLot = ({ setSelectedCity }) => {
  const [citiesCollection, setCitiesCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCities = async () => {
      try {
        const response = await fetchCities();
        if (response && Array.isArray(response.cities)) {
          setCitiesCollection(response.cities);
        }
      } catch (error) {
        console.error('An error occurred while fetching cities:', error);
        setError('Failed to fetch cities');
      } finally {
        setLoading(false);
      }
    };
    handleCities();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <h3 className='mb-4'>Choose a Parking Lot</h3>
      <div className='flex flex-row flex-wrap justify-center gap-4'>
        {citiesCollection.map((city) => (
          <div key={city.idCities} className='flex flex-col items-center'>
            <Avatar isBordered src={city.pictureUrl} size='lg' alt={`${city.CityName} Avatar`} onClick={() => setSelectedCity(city)} />
            <div className='mt-2 text-center'>{city.CityName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
