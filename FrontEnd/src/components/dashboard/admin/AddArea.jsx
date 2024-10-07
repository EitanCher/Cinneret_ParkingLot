import React, { useState } from 'react';
import { Card, CardBody, Input, Button } from '@nextui-org/react';
import { postAddArea } from '@/api/adminApi';

export const AddArea = ({ selectedCity, areas, setAreas }) => {
  const [areaName, setAreaName] = useState(''); // State to store the area name

  const handleAddArea = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      const newArea = await postAddArea(selectedCity.idCities, areaName);
      if (newArea) {
        console.log('New area added successfully!');
        // Update the parent state without re-fetching
        setAreas([...areas, newArea]); // Append the new area to the existing areas
        setAreaName(''); // Clear the input field
      }
    } catch (error) {
      console.error('Failed to add new area:', error);
    }
  };

  return (
    <Card className='w-[400px] h-56'>
      <CardBody>
        <h2 className=' dark:text-[#f7fafc] font-semibold text-lg text-center mb-4'>Add New Area</h2>

        <form className='flex flex-col gap-4' onSubmit={handleAddArea}>
          <Input
            label='Area Name'
            placeholder='Enter area name'
            className='w-full'
            isRequired
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
          />

          <div className='flex justify-center mt-4'>
            <Button color='primary' type='submit' className='max-w-16'>
              Submit
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};
