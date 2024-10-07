import React, { useState, useEffect } from 'react';
import { Card } from '@nextui-org/react';
import { getSlots } from '@/api/adminApi';
import { UpdateSlots } from './UpdateSlots';
import { AddSlots } from './AddSlots';

export const ParkingLotsSlots = ({ selectedCity }) => {
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState(null);

  const fetchSlots = async () => {
    try {
      if (selectedCity && selectedCity.idCities) {
        const fetchedSlots = await getSlots({ cityId: selectedCity.idCities });
        setSlots(fetchedSlots);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedCity]);

  return (
    <div className='flex flex-col md:flex-row h-full p-4'>
      <div className='flex flex-col md:flex-row md:justify-center gap-8 w-full h-full'>
        <Card className='md:flex-[2] flex-1 flex justify-center min-h-80 items-center mb-4 md:mb-0 md:mr-4'>
          <UpdateSlots selectedCity={selectedCity} slots={slots} setSlots={setSlots} />
        </Card>

        <Card className='md:flex-[1] flex-1 flex justify-center min-h-[650px] md:min-h-80 items-center mb-4 md:mb-0 md:mr-4'>
          <AddSlots selectedCity={selectedCity} slots={slots} setSlots={setSlots} />
        </Card>
      </div>

      {error && <p className='text-red-500 text-center'>{error}</p>}
    </div>
  );
};
