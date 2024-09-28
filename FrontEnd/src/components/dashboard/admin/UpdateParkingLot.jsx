import React, { useState } from 'react';
import { Input, Button, Card, CardBody } from '@nextui-org/react';
import { updateParkingLot } from '@/api/adminApi';

export const UpdateParkingLot = ({ selectedCity }) => {
  // Use the selectedCity values as initial state
  const [cityName, setCityName] = useState(selectedCity.CityName || '');
  const [fullAddress, setFullAddress] = useState(selectedCity.FullAddress || '');
  const [pictureUrl, setPictureUrl] = useState(selectedCity.pictureUrl || '');
  const [error, setError] = useState(null);

  const handleUpdateParkingLot = async (e) => {
    try {
      e.preventDefault();

      const response = await updateParkingLot(selectedCity.idCities, cityName, fullAddress, pictureUrl);

      if (response.status === 200) {
        console.log('Parking lot updated successfully!');
        // Refresh the selectedCity data to reflect the updated values
        selectedCity.CityName = cityName;
        selectedCity.FullAddress = fullAddress;
        selectedCity.pictureUrl = pictureUrl;
      }
    } catch (error) {
      setError('Failed to update parking lot. Please try again later.');
    }
  };

  // <div className='flex items-center justify-center bg-white dark:bg-neutral-900'>
  {
    /* <div className='p-6 md:p-10 rounded-2xl my-20 bg-white dark:bg-neutral-900 flex flex-col gap-4 w-full max-w-md'> */
  }
  return (
    <Card className='flex max-w-96 min-w-96 bg-white dark:bg-neutral-900'>
      <CardBody>
        <h4 className='text-center text-xl font-semibold'>Update Parking Lot</h4>
        <form className='flex flex-col gap-4' onSubmit={handleUpdateParkingLot}>
          <Input
            type='text'
            variant='underlined'
            size='sm'
            label='Name'
            placeholder='City Name'
            value={cityName}
            onChange={(e) => setCityName(e.target.value)} // Allow user to edit
          />
          <Input
            type='text'
            variant='underlined'
            size='sm'
            label='Address'
            placeholder='Full Address'
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)} // Allow user to edit
          />
          <Input
            type='url'
            variant='underlined'
            size='sm'
            label='Picture URL'
            placeholder='Picture URL'
            value={pictureUrl}
            onChange={(e) => setPictureUrl(e.target.value)} // Allow user to edit
          />
          <Button type='submit' color='primary'>
            Submit
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};
