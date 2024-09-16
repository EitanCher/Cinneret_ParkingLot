import React, { useState } from 'react';
import { Card, CardBody, Table, TableHeader, TableColumn, Pagination, TableBody, TableRow, TableCell } from '@nextui-org/react';

export const RecentUsersCard = () => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 2;

  // Dummy data for recent users
  const recentUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', registrationDate: '2024-08-01' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', registrationDate: '2024-08-02' },
    { id: 3, firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', registrationDate: '2024-08-03' },
    { id: 4, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', registrationDate: '2024-08-04' }
  ];

  // Calculate total pages
  const totalRows = recentUsers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Calculate the current rows to display
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = recentUsers.slice(startIndex, endIndex);

  return (
    <Card className='w-full bg-gray-100 dark:bg-neutral-800'>
      <CardBody>
        <h4 className='text-blue-600 font-semibold text-lg text-center mb-4'>Recent Users</h4>

        <Table
          removeWrapper
          aria-label='Recent Users Table'
          bottomContent={
            <div className='flex w-full justify-center'>
              <Pagination isCompact showControls showShadow color='primary' page={page} total={totalPages} onChange={(page) => setPage(page)} />
            </div>
          }
        >
          <TableHeader columns={userColumns}>
            {(column) => (
              <TableColumn className='bg-gray-300 dark:bg-zinc-700' key={column.key}>
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={paginatedRows}>
            {(item) => <TableRow key={item.id}>{(columnKey) => <TableCell>{item[columnKey]}</TableCell>}</TableRow>}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

// Columns for the recent users table
const userColumns = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'registrationDate', label: 'Registration Date' }
];
