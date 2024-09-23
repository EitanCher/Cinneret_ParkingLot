import React, { useState, useEffect } from 'react';
import { Input, Button } from '@nextui-org/react';
import { updateParkingLot, fetchParkingLotById } from '../../../api/adminApi';

export const UpdateParkingLot = ({ idCities }) => {
  const [cityName, setCityName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadParkingLot = async () => {
      try {
        const parkingLot = await fetchParkingLotById(idCities);
        setCityName(parkingLot.CityName);
        setFullAddress(parkingLot.FullAddress);
        setPictureUrl(parkingLot.pictureUrl);
      } catch (error) {
        setError('Failed to load parking lot details.');
      }
    };

    loadParkingLot();
  }, [idCities]);

  const handleOnSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      await updateParkingLot(idCities, cityName, fullAddress);
      setSuccess('Parking lot updated successfully!');
      setError('');
    } catch (error) {
      setError('Failed to update parking lot. Please try again later.');
      setSuccess('');
    }
  };

  return (
    <div className='flex items-center justify-center bg-white dark:bg-neutral-900'>
      <div className='p-6 md:p-10 rounded-2xl my-20 bg-white dark:bg-neutral-900 flex flex-col gap-4 w-full max-w-md'>
        <h4 className='text-center text-xl font-semibold'>Update Parking Lot</h4>
        {error && <p className='text-red-500 text-center'>{error}</p>}
        {success && <p className='text-green-500 text-center'>{success}</p>}
        <form className='flex flex-col gap-4' onSubmit={handleOnSubmit}>
          <Input
            type='text'
            variant='underlined'
            size='sm'
            label='Name'
            placeholder='Parking lot name'
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
          />
          <Input
            type='text'
            variant='underlined'
            size='sm'
            label='Address'
            placeholder='Parking lot address'
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
          />
          <Input
            type='url'
            variant='underlined'
            size='sm'
            label='Picture URL'
            placeholder='Picture URL'
            value={pictureUrl}
            onChange={(e) => setPictureUrl(e.target.value)}
          />
          <Button type='submit' color='primary'>
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};
