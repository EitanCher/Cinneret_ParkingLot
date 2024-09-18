import React, { useState, useEffect } from 'react';
import { CircularProgress, Card, CardBody, CardFooter, Chip } from '@nextui-org/react';
import {} from '../../../api/adminApi';
import { fetchAverageParkingTimeAllUsers } from '../../../api/adminApi';
let maxDurationReservation = 24;

export const AverageParkingCard = () => {
  const [avgTime, setAvgTime] = useState('');
  const [dataPoints, setDataPoints] = useState(0);
  const [error, setError] = useState(null);
  useEffect(() => {
    const handleAverageParkingData = async () => {
      try {
        const response = await fetchAverageParkingTimeAllUsers();
        console.log('response data:', response.averageParkingTime.formattedAverageDuration);
        setAvgTime(response.averageParkingTime.formattedAverageDuration);
        setDataPoints(response.averageParkingTime.dataPoints);
      } catch (error) {
        console.error('An error occurred while fetching average parking time:', error);
      }
    };
    handleAverageParkingData();
  }, []);

  return (
    <Card className='w-full  max-w-md border-none bg-gradient-to-br from-gray-100 to-gray-300'>
      <CardBody className=' items-center pb-0'>
        <h4 className='text-neutral-700 dark:text-neutral-200 text-center mb-4'>Average parking time</h4>
        <CircularProgress
          classNames={{
            svg: 'w-36 h-36 drop-shadow-md',
            indicator: 'stroke-white',
            track: 'stroke-black/15',
            value: 'text-3xl font-semibold text-white'
          }}
          value={avgTime}
          strokeWidth={4}
          formatOptions={{ style: 'unit', unit: 'hour' }}
          showValueLabel={true}
          maxValue={maxDurationReservation}
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
          {dataPoints} Data points
        </Chip>
      </CardFooter>
    </Card>
  );
};
