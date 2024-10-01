import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { deleteCity } from '@/api/adminApi';
import { useNavigate } from 'react-router-dom';
import { DeleteParkingLot } from '../DeleteParkingLot';
import { UpdateParkingLot } from '../UpdateParkingLot';
export const Areas = ({ selectedCity }) => {
  return (
    <div className='flex flex-1 h-full'>
      <div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full items-center'>
        <UpdateParkingLot selectedCity={selectedCity} />
        OR
        <DeleteParkingLot selectedCity={selectedCity} />
      </div>
    </div>
  );
};
