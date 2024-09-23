import React, { useEffect, useState } from 'react';
import { Card, CardBody, Select, SelectItem, DatePicker, Slider } from '@nextui-org/react';
import { now, getLocalTimeZone } from '@internationalized/date';
import { fetchUserCars } from '../../../api/userApi';

const ReservationCard = ({ selectedCity, userData }) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedDate, setSelectedDate] = useState(now(getLocalTimeZone()));
  const [cars, setCars] = useState([]);
  const [duration, setDuration] = useState(1); // Initialize duration state

  useEffect(() => {
    const handleCars = async () => {
      try {
        const userCars = await fetchUserCars();
        console.log('Fetched user cars:', userCars);
        setCars(userCars);
      } catch (error) {
        console.error('Error fetching user cars:', error);
      }
    };
    handleCars();
  }, []);

  const handleCarChange = (event) => {
    const value = event.target.value; // Extract the value from the event
    const carId = Number(value); // Convert the value to a number
    const car = cars.find((car) => car.idCars === carId);
    setSelectedCar(car); // Set the entire car object
  };

  const formatDate = (date) => {
    if (date && date.toString) {
      return date.toString(); // or any formatting logic you prefer
    }
    return 'date not selected';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prepare data for submission
    const slotId = 'some-slot-id'; // Replace with the actual slot ID
    const StartDate = selectedDate.toString();
    const Duration = duration;
    const idCars = selectedCar ? selectedCar.idCars : null;

    // You can now send this data to your API
    try {
      const response = await fetch('/api/book-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slotId, StartDate, Duration, idCars })
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error booking slot:', error);
    }
  };

  return (
    <Card className='mt-4'>
      <CardBody>
        <h2 className='text-lg font-semibold'>Reserve a Slot in {selectedCity.CityName}</h2>

        <form onSubmit={handleSubmit}>
          <Select label='Select Your Car' className='mt-4' onChange={handleCarChange}>
            {cars.map((car) => (
              <SelectItem
                key={car.idCars}
                value={car.idCars.toString()} // Ensure value is a string
                textValue={car.Model} // Added for accessibility
              >
                {car.Model}
              </SelectItem>
            ))}
          </Select>

          <DatePicker
            label='Select Date and Time'
            variant='bordered'
            hideTimeZone
            showMonthAndYearPickers
            defaultValue={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className='mt-4'
          />

          <Slider
            label='Duration (hours)'
            minValue={1}
            maxValue={24}
            defaultValue={1}
            step={1}
            onChange={setDuration} // Update the duration state on change
            className='mt-4 max-w-md'
          />

          <div className='mt-4'>
            <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded'>
              Reserve Slot
            </button>
          </div>
        </form>

        <div className='mt-2 text-green-600'>
          Selected city: {selectedCity.CityName}, Username: {userData.FirstName}, selected car: {selectedCar ? selectedCar.idCars : 'not selected'},
          selected date: {formatDate(selectedDate)}, duration: {duration} hours.
        </div>
      </CardBody>
    </Card>
  );
};

export default ReservationCard;
