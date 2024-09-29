import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { deleteCity } from '@/api/adminApi';
import { useNavigate } from 'react-router-dom';

export const DeleteParkingLot = ({ selectedCity }) => {
  const navigate = useNavigate();

  const handleDeleteCity = async () => {
    try {
      await deleteCity(selectedCity.idCities);
      console.log('Parking lot deleted successfully');
      navigate('/AdminDashboard/ParkingLots');
    } catch (error) {
      console.error('Error deleting parking lot:', error);
    }
  };

  return (
    <Button onClick={handleDeleteCity} className='mt-4 w-full max-w-[80px]'>
      Delete
    </Button>
  );
};
