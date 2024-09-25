import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter } from '@nextui-org/card';
import { fetchIncomeData, fetchUserCounts } from '../../../api/adminApi';
import { IncomeDataCard } from './IncomeDataCard';
export const IncomeAndUserCount = () => {
  const [userCounts, setUserCounts] = useState({
    inactiveUserCount: 0,
    activeUserCount: 0,
    totalUserCount: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleUserCounts = async () => {
      try {
        const counts = await fetchUserCounts();
        const { inactiveUserCount, activeUserCount, totalUserCount } = counts;
        setUserCounts({ inactiveUserCount, activeUserCount, totalUserCount });
      } catch (error) {
        setError('An error occurred while fetching user counts.');
      }
    };
    handleUserCounts();
  }, []);

  return (
    <Card className='w-full min-h-56 max-w-md bg-gray-100 dark:bg-neutral-800'>
      <IncomeDataCard className='bg-gray-100 dark:bg-neutral-800' />
      <CardFooter className='flex flex-col justify-center items-center bg-gray-100 dark:bg-neutral-800'>
        <h3 className='text-lg text-center font-medium text-gray-800 dark:text-gray-200'>User Counts</h3>
        <p className='text-sm text-center text-gray-600 dark:text-gray-300'>
          {error
            ? error
            : `Active: ${userCounts.activeUserCount} || Inactive: ${userCounts.inactiveUserCount} || Total: ${userCounts.totalUserCount}`}
        </p>
      </CardFooter>
    </Card>
  );
};
