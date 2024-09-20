import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter } from '@nextui-org/card';
import { DateRangePicker } from '@nextui-org/react';
import { fetchIncomeData } from '../../../api/adminApi';

export const IncomeDataCard = ({ title }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDateRangeChange = async (range) => {
    if (range && range[0] && range[1]) {
      const startDate = new Date(range[0]);
      const endDate = new Date(range[1]);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        setDateRange([startDate, endDate]);
        setLoading(true);
        setError(null);

        try {
          const data = await fetchIncomeData({ startDate, endDate });
          setIncomeData(data);
        } catch {
          setError('Failed to fetch income data.');
        } finally {
          setLoading(false);
        }
      } else {
        console.error('Invalid date objects:', startDate, endDate);
      }
    } else {
      console.error('Date range is not in the expected format:', range);
    }
  };

  return (
    <Card className='w-full max-w-md bg-gray-100 dark:bg-neutral-800'>
      <CardBody className='flex flex-col gap-4'>
        <h3 className='text-lg text-center font-medium text-gray-800 dark:text-gray-200'>{error ? error : `Income for ${dateRange}`}</h3>
        <DateRangePicker aria-label='Select date range for income data' value={dateRange} onChange={handleDateRangeChange} isRequired />
        <div className='ml-2'>
          {loading ? (
            <p className='text-sm text-gray-600 dark:text-gray-300'>Loading...</p>
          ) : error ? (
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          ) : incomeData ? (
            <p className='text-sm font-bold text-gray-600 dark:text-gray-300'>Total Income: ${incomeData.totalIncome}</p>
          ) : (
            <p className='text-sm text-gray-600 dark:text-gray-300'>No income data available.</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
