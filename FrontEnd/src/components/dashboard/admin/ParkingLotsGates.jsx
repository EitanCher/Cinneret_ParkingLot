import React, { useState } from 'react';
import { Card } from '@nextui-org/react';
import { UpdateGates } from './UpdateGates';
import { AddGates } from './AddGates';

export const ParkingLotGates = ({ selectedCity }) => {
  const [error, setError] = useState(null);

  return (
    <div className='flex flex-col md:flex-row h-full p-4'>
      <div className='flex flex-col md:flex-row md:justify-center gap-8 w-full h-full'>
        <Card className='md:flex-[2] flex-1 flex justify-center min-h-80 items-center mb-4 md:mb-0 md:mr-4'>
          <UpdateGates selectedGate={null} />
        </Card>

        <Card className='md:flex-[1] flex-1 flex justify-center min-h-[650px] md:min-h-80 items-center mb-4 md:mb-0 md:mr-4'>
          <AddGates />
        </Card>
      </div>

      {error && <p className='text-red-500 text-center'>{error}</p>}
    </div>
  );
};
