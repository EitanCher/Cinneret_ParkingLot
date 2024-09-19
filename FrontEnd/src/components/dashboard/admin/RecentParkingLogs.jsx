import React, { useState, useEffect } from 'react';
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from '@nextui-org/react';
import { fetchRecentParkingLogs } from '../../../api/adminApi';

export const RecentParkingLogsCard = () => {
  const [page, setPage] = useState(1);
  const [parkingLogs, setParkingLogs] = useState([]);
  const [error, setError] = useState(null);
  const rowsPerPage = 6;

  // Calculate total pages
  const totalRows = parkingLogs.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = parkingLogs.slice(startIndex, endIndex);

  useEffect(() => {
    const handleParkingLogsData = async () => {
      try {
        const logs = await fetchRecentParkingLogs();
        console.log('parkingLogs in RecentParkingLogsCard.jsx:', logs);
        setParkingLogs(logs);
      } catch (error) {
        setError('Failed to fetch recent parking logs');
      }
    };
    handleParkingLogsData();
  }, []);

  return (
    <Card className='w-full min-h-60 bg-gray-100 dark:bg-neutral-800'>
      <CardBody>
        <h4 className='text-blue-600 font-semibold text-lg text-center mb-4'>Recent Parking Logs</h4>

        {error && <p className='text-red-500 text-center'>{error}</p>}

        <Table removeWrapper aria-label='Recent Parking Logs Table'>
          <TableHeader columns={logColumns}>
            {(column) => (
              <TableColumn className='bg-gray-300 dark:bg-zinc-700' key={column.key}>
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={paginatedRows}>
            {(item) => <TableRow key={item.registrationNo}>{(columnKey) => <TableCell>{item[columnKey]}</TableCell>}</TableRow>}
          </TableBody>
        </Table>

        <div className='flex w-full justify-center mt-4'>
          <Pagination isCompact showControls showShadow color='primary' page={page} total={totalPages} onChange={(page) => setPage(page)} />
        </div>
      </CardBody>
    </Card>
  );
};

// Columns for the recent parking logs table
const logColumns = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'carModel', label: 'Car Model' },
  { key: 'registrationNo', label: 'Registration No.' },
  { key: 'reservation', label: 'Reservation' },
  { key: 'entrance', label: 'Entrance' },
  { key: 'exit', label: 'Exit' },
  { key: 'needToExitBy', label: 'Need to Exit By' }
];
