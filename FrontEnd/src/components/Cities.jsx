import React, { useEffect, useState } from 'react';
import { Spinner, Card, CardBody, CardFooter, Image, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { fetchCities } from '../api/userApi';
import { useTheme } from '../Context/ThemeContext';
import io from 'socket.io-client'; // Import socket.io-client

const socket = io('http://localhost:3001'); // WebSocket server URL

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle errors
  const { isDarkMode } = useTheme(); // Add this line to get the dark mode state
  const [availableSpots, setAvailableSpots] = useState({}); // State to store live available parking spots
  const [activePopover, setActivePopover] = useState(null); // Track the active popover

  useEffect(() => {
    const getCities = async () => {
      try {
        const data = await fetchCities();
        console.log('Fetched cities data:', data); // Log the fetched data

        if (Array.isArray(data.cities)) {
          setCities(data.cities);

          // Subscribe to available spot updates for each city
          data.cities.forEach((city) => {
            console.log(`Subscribing to city: ${city.idCities}`); // Debug log
            socket.emit('subscribe_to_city', city.idCities); // Subscribe to updates for each city
          });
        } else {
          console.error('Fetched data is not an array:', data.cities);
          setError('Data format error');
        }
      } catch (error) {
        setError('Failed to fetch cities');
      } finally {
        setLoading(false);
      }
    };

    getCities();

    // Listen for updates on available spots
    socket.on('count_available_spots', (cityID, count) => {
      console.log(`Received spots for city ${cityID}: ${count}`); // Debug log
      setAvailableSpots((prev) => ({
        ...prev,
        [cityID]: count
      }));
    });

    socket.on('updateAvailableSpots', (cityID, count) => {
      console.log(`Updated spots for city ${cityID}: ${count}`); // Debug log
      setAvailableSpots((prev) => ({
        ...prev,
        [cityID]: count
      }));
    });

    return () => {
      socket.off('count_available_spots'); // Clean up the socket listener on component unmount
      socket.off('updateAvailableSpots'); // Clean up the socket listener on component unmount
    };
  }, []);

  const handlePopoverOpenChange = (isOpen, cityID) => {
    if (isOpen) {
      console.log(`Popover opened for city: ${cityID}`); // Debug log
      setActivePopover(cityID);
    } else {
      console.log(`Popover closed for city: ${cityID}`); // Debug log
      setActivePopover(null);
    }
  };

  if (loading) {
    return (
      <div className='p-4 flex justify-center items-center'>
        <Spinner size='lg' label='Loading cities...' color='primary' />
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className='px-4 py-10'>
      <h2 className='text-2xl font-bold mb-6 text-center'>Our parking lots</h2>
      <p className='text-sm text-gray-500 mb-4 text-center pb-4 px-10 dark:text-gray-300'>
        Explore Our Cities. Discover the vibrant and diverse cities we serve! Whether you're planning a visit or looking for convenient parking
        solutions, we have a variety of parking lots available in some of the most dynamic urban areas. From bustling downtowns to charming
        neighborhoods, you'll find our parking facilities strategically located to meet your needs. Check out our selection of parking lots and make
        your city experience seamless and enjoyable.
      </p>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto'>
        {cities.map((city, index) => (
          <Popover
            key={index}
            placement='bottom'
            showArrow
            backdrop='blur'
            onOpenChange={(isOpen) => handlePopoverOpenChange(isOpen, city.idCities)} // Track when the popover opens or closes
          >
            <PopoverTrigger>
              <Card
                className={`card ${isDarkMode ? 'bg-card-bg text-card-text border-card-border' : 'bg-white text-gray-900'}`}
                shadow='sm'
                isPressable
              >
                <CardBody className='overflow-visible p-0'>
                  <Image
                    shadow='sm'
                    radius='lg'
                    width='100%'
                    alt={city.CityName}
                    className='w-full object-cover h-[140px]'
                    src={city.pictureUrl} // Placeholder image
                  />
                </CardBody>
                <CardFooter className='text-small flex items-center justify-between'>
                  <b>{city.CityName}</b>
                  <p className='text-default-500 text-right'>{city.FullAddress}</p>
                </CardFooter>
              </Card>
            </PopoverTrigger>
            <PopoverContent>
              <div className='p-4'>
                <p className='text-small font-bold text-foreground'>
                  {availableSpots[city.idCities] !== undefined ? `${availableSpots[city.idCities]} spots available` : 'Loading...'}
                </p>
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  );
};

export default Cities;
