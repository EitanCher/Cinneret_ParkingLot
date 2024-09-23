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
    <div className='flex flex-wrap justify-center'>
      {citiesCollection.map((city) => (
        <div key={city.idCities} className='flex flex-col items-center m-2 min-w-24'>
          <Avatar isBordered src={city.pictureUrl} size='lg' alt={`${city.CityName} Avatar`} onClick={() => setSelectedCity(city)} />
          <div className='mt-2 text-center flex-wrap'>{city.CityName}</div>
        </div>
      ))}
    </div>
  );
};
