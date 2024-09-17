import React, { useState, useEffect } from 'react';
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from '@nextui-org/react';
import { fetchRecentSubscriptions } from '../../../api/adminApi';
export const RecentUsersCard = () => {
  const [page, setPage] = useState(1);
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState(null);
  const rowsPerPage = 6;

  // Calculate total pages
  const totalRows = recentUsers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = recentUsers.slice(startIndex, endIndex);

  useEffect(() => {
    const handleRecentUserData = async () => {
      try {
        const subscriptions = await fetchRecentSubscriptions();
        console.log('subscriptions in recentUsers.jsx:', subscriptions);
        setRecentUsers(subscriptions);
      } catch (error) {
        setError('Failed to fetch recent users');
      }
    };
    handleRecentUserData();
  }, []);
  return (
    <Card className='w-full bg-gray-100 dark:bg-neutral-800'>
      <CardBody>
        <h4 className='text-blue-600 font-semibold text-lg text-center mb-4'>Recent Users</h4>

        <Table removeWrapper aria-label='Recent Users Table'>
          <TableHeader columns={userColumns}>
            {(column) => (
              <TableColumn className='bg-gray-300 dark:bg-zinc-700' key={column.key}>
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={paginatedRows}>
            {(item) => <TableRow key={item.Email || item.Name}>{(columnKey) => <TableCell>{item[columnKey]}</TableCell>}</TableRow>}
          </TableBody>
        </Table>

        <div className='flex w-full justify-center mt-4'>
          <Pagination isCompact showControls showShadow color='primary' page={page} total={totalPages} onChange={(page) => setPage(page)} />
        </div>
      </CardBody>
    </Card>
  );
};

// Columns for the recent users table
const userColumns = [
  { key: 'Name', label: 'Name' },
  { key: 'Email', label: 'Email' },
  { key: 'SubscriptionPlan', label: 'Subscription Plan' },
  { key: 'Price', label: 'Price' },
  { key: 'StartDate', label: 'Start Date' }
];
