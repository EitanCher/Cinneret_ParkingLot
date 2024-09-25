import React, { useEffect, useState } from 'react';
import { Select, SelectItem, Button, Image, DatePicker } from '@nextui-org/react';
import { parseDate } from '@internationalized/date';
import { fetchUserCars, fetchMatchingSlots, postBookSlot } from '../../../api/userApi';
import ReservationTable from './ReservationTable';

const ReservationCard = ({ selectedCity, userData }) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedDate, setSelectedDate] = useState(parseDate(new Date().toISOString().split('T')[0])); // Use @internationalized/date to initialize
  const [cars, setCars] = useState([]);
  const [matchingSlots, setMatchingSlots] = useState(null);
  const [responseError, setResponseError] = useState(null);
  const [selectedTimeframes, setSelectedTimeframes] = useState([]); // Store selected timeframes

  // Fetch the user's cars when the component mounts
  useEffect(() => {
    const handleCars = async () => {
      try {
        const userCars = await fetchUserCars();
        setCars(userCars);
      } catch (error) {
        console.error('Error fetching user cars:', error);
      }
    };
    handleCars();
  }, []);

  // Handle car selection
  const handleCarChange = (event) => {
    const value = event.target.value;
    const carId = Number(value);
    const car = cars.find((car) => car.idCars === carId);
    setSelectedCar(car);
  };

  // Handle find slot action
  const handleFindSlot = async (event) => {
    event.preventDefault();
    setResponseError(null);
    setMatchingSlots(null);

    try {
      const jsDate = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
      const startDateTime = jsDate.toISOString(); // Format as ISO string

      const slots = await fetchMatchingSlots(selectedCity.idCities, startDateTime);
      if (slots && slots.slots) {
        setMatchingSlots(slots);
        console.log('Found matching slots:', slots);
      } else {
        setMatchingSlots(null);
        console.log('No matching slots found');
      }
    } catch (error) {
      console.error('Error in handleFindSlot:', error.message);
      setResponseError(error.message);
    }
  };

  // Handle slot reservation
  const handleReserve = async () => {
    if (selectedTimeframes.length === 0) {
      console.error('No timeframes selected!');
      setResponseError('Please select one or more timeframes.');
      return;
    }

    // Calculate the start time (earliest selected start) and end time (latest selected end)
    const startTime = new Date(
      selectedTimeframes.reduce(
        (earliest, timeframe) => (new Date(timeframe.start) < new Date(earliest) ? timeframe.start : earliest),
        selectedTimeframes[0].start
      )
    );
    const endTime = new Date(
      selectedTimeframes.reduce(
        (latest, timeframe) => (new Date(timeframe.end) > new Date(latest) ? timeframe.end : latest),
        selectedTimeframes[0].end
      )
    );

    console.log('Attempting to reserve the following time range:', {
      slotId: selectedTimeframes[0].slotId,
      startTime,
      endTime,
      carId: selectedCar.idCars
    });

    setResponseError(null); // Clear previous errors

    try {
      const response = await postBookSlot(selectedTimeframes[0].slotId, startTime.toISOString(), endTime.toISOString(), selectedCar.idCars);
      console.log('Reservation successful:', response);
    } catch (error) {
      console.error('Error in handleReserve:', error.message);

      // Handle the 403 forbidden error
      if (error.response && error.response.status === 403) {
        setResponseError(`You exceeded your maximum reservations limit of ${error.response.data.maxReservations}`);
      } else {
        // Handle other types of errors
        setResponseError('An error occurred while booking the reservation. Please try again.');
      }
    }
  };

  return (
    <div className='flex flex-col items-center min-h-screen px-4'>
      <h2 className='font-semibold text-center mb-6'>Reserve a Slot in {selectedCity.CityName}</h2>

      <form onSubmit={handleFindSlot} className='flex flex-col items-center w-full max-w-md mb-4'>
        <div className='flex items-center w-full'>
          <DatePicker label='Select Date' className='max-w-[284px]' value={selectedDate} onChange={(date) => setSelectedDate(date)} />
          <div className='ml-7 mt-1'>
            <Button color='primary' type='submit'>
              Find Slot
            </Button>
          </div>
        </div>
      </form>

      <Image isZoomed width={670} height={300} alt={`Image of ${selectedCity.CityName}`} src={selectedCity.pictureUrl} />

      {matchingSlots && matchingSlots.slots && (
        <div className='mt-4 w-full max-w-2xl'>
          <ReservationTable slots={matchingSlots.slots} onTimeframeSelect={setSelectedTimeframes} />
        </div>
      )}

      {matchingSlots && matchingSlots.slots && (
        <div className='mt-4 w-full flex items-center justify-center'>
          <Select isRequired label='Select Your Car' className='max-w-xs' onChange={handleCarChange}>
            {cars.map((car) => (
              <SelectItem key={car.idCars} value={car.idCars.toString()} textValue={car.Model}>
                {car.Model}
              </SelectItem>
            ))}
          </Select>

          {selectedCar && (
            <div className='ml-4'>
              <Button color='success' onClick={handleReserve}>
                Reserve
              </Button>
            </div>
          )}
        </div>
      )}

      {responseError && <div className='mt-4 text-red-600 text-center'>{responseError}</div>}
    </div>
  );
};

export default ReservationCard;
