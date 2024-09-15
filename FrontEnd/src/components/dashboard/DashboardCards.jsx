import React from 'react';
import { useState } from 'react';

import { Card, CardBody } from '@nextui-org/card';
import { DateRangePicker } from '@nextui-org/react';
import { fetchIncomeData } from '../../api/adminApi';
export const PlaceholderCard = () => {
  return (
    <Card className='w-full max-w-md bg-gray-100 dark:bg-neutral-800 animate-pulse'>
      <CardBody className='h-20'>
        <div className='h-full w-full flex flex-col justify-between'></div>
      </CardBody>
    </Card>
  );
};
export const ViewOnly = ({ title, content }) => (
  <Card className='w-full max-h-24 max-w-md bg-gray-100 dark:bg-neutral-800'>
    <CardBody>
      <h3 className='text-lg text-center font-medium text-gray-800 dark:text-gray-200'>{title}</h3>
      <p className='text-sm text-center text-gray-600 dark:text-gray-300'>{content}</p>
    </CardBody>
  </Card>
);

export const IncomeDataCard = ({ title }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle date range change and fetch income data

  const handleDateRangeChange = async (range) => {
    if (range && range.start && range.end) {
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        setDateRange([startDate, endDate]);
        setLoading(true);
        setError(null);

        try {
          const data = await fetchIncomeData({
            startDate: startDate, // Directly sending Date object, if acceptable
            endDate: endDate
          });
          console.log('data in dashboardCards.jsx', data);
          setIncomeData(data);
        } catch (err) {
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
    <Card className='w-full max-h-36 max-w-md bg-gray-100 dark:bg-neutral-800'>
      <CardBody className='flex flex-col gap-4'>
        {/* Title */}
        <h3 className='text-lg text-center font-medium text-gray-800 dark:text-gray-200'>{title || 'Income'}</h3>

        {/* Date Range Picker */}
        <DateRangePicker aria-label='Select date range for income data' value={dateRange} onChange={handleDateRangeChange} isRequired />

        {/* Income Data Display */}
        <div className='ml-2'>
          {loading ? (
            <p className='text-sm text-gray-600 dark:text-gray-300'>Loading...</p>
          ) : error ? (
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          ) : incomeData ? (
            <div>
              <p className='text-sm font-bold text-gray-600 dark:text-gray-300'>
                Total Income: ${incomeData.totalIncome} {/* Adjust based on your API response */}
              </p>
            </div>
          ) : (
            <p className='text-sm text-gray-600 dark:text-gray-300'>No income data available.</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
