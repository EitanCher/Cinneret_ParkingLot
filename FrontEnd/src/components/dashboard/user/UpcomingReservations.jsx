import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from '@nextui-org/react';
import { cancelReservation } from '@/api/userApi';
export const UpcomingReservations = ({ reservations, setReservations }) => {
  const handleCancel = async (idReservation) => {
    try {
      const response = await cancelReservation(idReservation);
      console.log('Canceled reservation:', response);
      setReservations((prevReservations) => prevReservations.filter((reservation) => reservation.idReservation !== idReservation));
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };
  return (
    <div className='overflow-x-auto w-full max-w-[900px]'>
      <Table aria-label='Upcoming Reservations' className='w-full min-w-[640px] shadow-md rounded-lg' selectionMode='none'>
        <TableHeader className='bg-gray-100 dark:bg-gray-800'>
          <TableColumn>Car</TableColumn>
          <TableColumn>City</TableColumn>
          <TableColumn>Area</TableColumn>
          <TableColumn>Slot ID</TableColumn>
          <TableColumn>Start Time</TableColumn>
          <TableColumn>End Time</TableColumn>
          <TableColumn>Cancel</TableColumn>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.idReservation} className='hover:bg-gray-100 dark:hover:bg-gray-700'>
              <TableCell>{reservation.Cars?.Model || 'N/A'}</TableCell>
              <TableCell>{reservation.Slots?.Areas?.Cities?.CityName || 'N/A'}</TableCell>
              <TableCell>{reservation.Slots?.Areas?.AreaName || 'N/A'}</TableCell>
              <TableCell>{reservation.SlotID}</TableCell>
              <TableCell>{new Date(reservation.ReservationStart).toLocaleString()}</TableCell>
              <TableCell>{new Date(reservation.ReservationEnd).toLocaleString()}</TableCell>
              <TableCell>
                <Button color='danger' size='sm' onClick={() => handleCancel(reservation.idReservation)} className='text-white font-semibold'>
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
