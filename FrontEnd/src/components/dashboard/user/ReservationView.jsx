import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { cancelReservation } from '@/api/userApi';

export const ReservationView = ({ reservation, setReservations, reservationsNum }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState('upcoming'); // Default to 'upcoming' to indicate that the reservation hasn't started yet
  const [targetTime, setTargetTime] = useState(null); // Store the target time for countdown

  useEffect(() => {
    if (!reservation) return;

    // Recalculate the reservation start and end times each time the reservation prop changes
    const currentTime = new Date().getTime();
    const reservationStartTime = new Date(reservation.ReservationStart).getTime();
    const reservationEndTime = new Date(reservation.ReservationEnd).getTime();

    // Determine if the reservation is upcoming or current
    if (currentTime < reservationStartTime) {
      // Reservation is upcoming
      setTargetTime(reservationStartTime);
      setStatus('upcoming');
    } else if (currentTime >= reservationStartTime && currentTime <= reservationEndTime) {
      // Reservation is current
      setTargetTime(reservationEndTime);
      setStatus('current');
    } else {
      // Reservation has ended; no need to display a timer
      setTargetTime(null);
      setStatus('ended');
    }
  }, [reservation]); // Run this effect every time the `reservation` prop changes

  useEffect(() => {
    if (!targetTime) return;

    // Function to calculate time left in seconds
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    };

    // Set initial time left
    setTimeLeft(calculateTimeLeft());

    // Create a timer that updates the time left every second
    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up the interval when the component is unmounted or targetTime changes
    return () => clearInterval(timerId);
  }, [targetTime]); // The timer effect depends only on `targetTime`

  // Calculate days, hours, minutes, and seconds from timeLeft
  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const cityName = reservation?.Slots?.Areas?.Cities?.CityName || 'N/A';
  const areaName = reservation?.Slots?.Areas?.AreaName || 'N/A';
  const slotId = reservation?.SlotID || 'N/A';

  const handleCancel = async () => {
    try {
      await cancelReservation(reservation.idReservation);
      setReservations((prevReservations) => prevReservations.filter((res) => res.idReservation !== reservation.idReservation));
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };

  // Don't show the card if the reservation has ended
  if (status === 'ended') return null;

  return (
    <Card className='flex flex-col items-center m-8'>
      <CardBody>
        <h2 className='underline decoration-1 decoration-neutral-400 underline-offset-4 md:text-2xl text-center font-bold mt-4'>
          {status === 'upcoming' ? 'Time until reservation starts' : 'Time until reservation ends'}
        </h2>
        <div className=' md:text-3xl text-center font-mono mx-8 my-6'>
          {days}d : {hours}h : {minutes}m : {seconds}s
        </div>
        <p className='text-center'>{`Reservation Details - City: ${cityName}, Area: ${areaName}, Slot ID: ${slotId}`}</p>

        {reservationsNum == 1 && (
          <div className='mt-4 flex justify-center'>
            <Button color='danger' size='sm' onClick={handleCancel}>
              Cancel Reservation
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
