import React, { useEffect, useState } from 'react';
import { Spinner, Card, CardBody, CardFooter, Image } from '@nextui-org/react'; // Import components from NextUI
import { fetchCities } from '../api/userApi'; // Import the fetchCities function

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    const getCities = async () => {
      try {
        const data = await fetchCities();
        console.log('Fetched cities data:', data); // Log the fetched data

        if (Array.isArray(data.cities)) {
          setCities(data.cities);
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
  }, []);

  if (loading) {
    // Use return to render the Spinner component
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
      <p className='text-sm text-gray-500 mb-4 text-center pb-4 px-10'>
        Explore Our Cities Discover the vibrant and diverse cities we serve! Whether you're planning a visit or looking for convenient parking
        solutions, we have a variety of parking lots available in some of the most dynamic urban areas. From bustling downtowns to charming
        neighborhoods, you'll find our parking facilities strategically located to meet your needs. Check out our selection of parking lots and make
        your city experience seamless and enjoyable.
      </p>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto'>
        {cities.map((city, index) => (
          <Card className='card' shadow='sm' key={index} isPressable onPress={() => console.log(`${city.CityName} pressed`)}>
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
        ))}
      </div>
    </div>
  );
};

export default Cities;
