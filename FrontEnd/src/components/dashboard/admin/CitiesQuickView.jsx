import React, { useState, useEffect } from 'react';
import { Avatar, Popover, PopoverTrigger, PopoverContent, Card, CardBody } from '@nextui-org/react';
import { fetchCities, fetchSlotCountsByCityId } from '../../../api/userApi';

const AvatarWithPopover = ({ city }) => {
  const [slotCounts, setSlotCounts] = useState({ total: 0, notBusy: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlotCounts = async () => {
      try {
        const response = await fetchSlotCountsByCityId(city.idCities);

        if (response) {
          setSlotCounts({
            total: response.totalSlotsCount,
            notBusy: response.availableSlotsCount
          });
        } else {
          console.error('Unexpected response format:', response);
          setError('Unexpected response format.');
        }
      } catch (error) {
        console.error('An error occurred while fetching slot counts:', error);
        setError('An error occurred while fetching slot counts.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlotCounts();
  }, [city.idCities]);

  return (
    <Popover backdrop='blur' showArrow placement='bottom'>
      <PopoverTrigger>
        <div className='cursor-pointer flex flex-col items-center'>
          <Avatar src={city.pictureUrl} size='lg' />
          <h4 className='mt-2 text-center text-xs text-ellipsis overflow-hidden whitespace-normal'>{city.CityName}</h4>
        </div>
      </PopoverTrigger>
      <PopoverContent className='p-4'>
        <div className='mb-2'>{city.CityName}</div>
        <p>Total occupancy: {slotCounts.total}</p>
        <p>Available slots: {slotCounts.notBusy}</p>
      </PopoverContent>
    </Popover>
  );
};

export const CitiesQuickView = () => {
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCities = async () => {
      try {
        const response = await fetchCities();
        if (response && Array.isArray(response.cities)) {
          setCities(response.cities);
        } else {
          console.error('Unexpected response format:', response);
          setError('Unexpected response format.');
        }
      } catch (error) {
        console.error('An error occurred while fetching cities:', error);
        setError('An error occurred while fetching cities.');
      }
    };
    handleCities(); // Fetch cities when the component mounts
  }, []);

  return (
    <Card className='w-full flex flex-col max-w-md  bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 font-medium text-lg'>
      <CardBody>
        <h4 className='text-neutral-700 dark:text-neutral-200 text-center mb-4'>Parking Lots</h4>
        <div className='flex items-center justify-center flex-wrap gap-4'>
          {Array.isArray(cities) && cities.length > 0 ? (
            cities.map((city) => <AvatarWithPopover key={city.idCities} city={city} />)
          ) : (
            <p className=''>No cities available.</p>
          )}
        </div>
        {error && <p className='text-red-600'>{error}</p>}
      </CardBody>
    </Card>
  );
};
