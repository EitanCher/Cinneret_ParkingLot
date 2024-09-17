import React, { useState, useEffect } from 'react';
import { CircularProgress, Card, CardBody, CardFooter, Chip } from '@nextui-org/react';
import {} from '../../../api/adminApi';

let maxDurationReservation = 24;
let maxDurationParkingNoReservation = 6;

export const AverageParkingCard = () => {
  useEffect(() => {}, []);

  return (
    <Card className='w-[240px] h-[240px] border-none bg-gradient-to-br from-violet-500 to-fuchsia-500'>
      <CardBody className='justify-center items-center pb-0'>
        <CircularProgress
          classNames={{
            svg: 'w-36 h-36 drop-shadow-md',
            indicator: 'stroke-white',
            track: 'stroke-white/10',
            value: 'text-3xl font-semibold text-white'
          }}
          value={70}
          strokeWidth={4}
          showValueLabel={true}
        />
      </CardBody>
      <CardFooter className='justify-center items-center pt-0'>
        <Chip
          classNames={{
            base: 'border-1 border-white/30',
            content: 'text-white/90 text-small font-semibold'
          }}
          variant='bordered'
        >
          2800 Data points
        </Chip>
      </CardFooter>
    </Card>
  );
};
