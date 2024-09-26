import React, { useState, useEffect } from 'react';
import { Avatar, Popover, PopoverTrigger, PopoverContent, Card, CardBody } from '@nextui-org/react';
import { fetchSlotCountsByCityId, fetchCities } from '../../../api/userApi';
import io from 'socket.io-client';

// Connect to the WebSocket server
const socket = io('http://localhost:3001'); // Adjust the URL as needed

const AvatarWithPopover = ({ city }) => {
  const [slotCounts, setSlotCounts] = useState({ total: 0, notBusy: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the initial total and available slots from the API
    const fetchSlotCounts = async () => {
      try {
        const response = await fetchSlotCountsByCityId(city.idCities);

        if (response) {
          setSlotCounts({
            total: response.totalSlotsCount, // Set the total slots (static)
            notBusy: response.availableSlotsCount // Set initial available slots
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

    // Subscribe to WebSocket updates for available spots
    socket.emit('subscribe_to_city', city.idCities); // Subscribe to this city

    // Listen for updates to the available spots
    socket.on('updateAvailableSpots', (cityID, availableSpots) => {
      if (cityID === city.idCities) {
        setSlotCounts((prev) => ({
          ...prev,
          notBusy: availableSpots
        }));
      }
    });

    // Cleanup the socket connection when the component unmounts
    return () => {
      socket.off('updateAvailableSpots'); // Remove the event listener when the component unmounts
    };
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
        <p>Total Slots: {slotCounts.total}</p>
        <p>Available slots: {loading ? 'Loading...' : error ? 'Error fetching slots' : slotCounts.notBusy}</p>
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
    handleCities();
  }, []);

  return (
    <Card className='w-full flex flex-col max-w-md  min-h-36 bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 font-medium text-lg'>
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
