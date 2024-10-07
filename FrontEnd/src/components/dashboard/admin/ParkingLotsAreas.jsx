import React, { useState, useEffect } from 'react';
import { Card } from '@nextui-org/react';
import { AddArea } from './AddArea';
import { UpdateArea } from './UpdateArea';
import { getAreas } from '@/api/adminApi';

export const ParkingLotsAreas = ({ selectedCity }) => {
  // Manage shared state for areas
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState(null);

  // Fetch the areas initially or when selectedCity changes
  useEffect(() => {
    const handleGetAreas = async () => {
      try {
        const response = await getAreas(selectedCity.idCities);
        console.log('Fetched areas:', response);
        setAreas(response.areas);
      } catch (error) {
        setError(error.message);
      }
    };

    handleGetAreas();
  }, [selectedCity.idCities]);

  return (
    <div className='flex flex-col md:flex-row h-full p-4'>
      <div className='flex flex-col md:flex-row md:justify-center gap-8 w-full h-full'>
        <Card className='flex-1  flex justify-center  items-center mb-4 md:mb-0 md:mr-4'>
          <AddArea selectedCity={selectedCity} areas={areas} setAreas={setAreas} />
        </Card>
        <Card className='flex-1'>
          <UpdateArea selectedCity={selectedCity} areas={areas} setAreas={setAreas} />
        </Card>
      </div>

      {error && <p className='text-red-500 text-center'>{error}</p>}
    </div>
  );
};
