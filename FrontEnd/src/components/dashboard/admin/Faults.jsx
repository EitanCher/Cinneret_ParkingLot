import React, { useState, useEffect } from 'react';
import { Card, CardBody, Table, TableHeader, TableColumn, Pagination, TableBody, TableRow, TableCell, Select, SelectItem } from '@nextui-org/react';
import { fetchFaultySlotsGates } from '../../../api/adminApi';

export const FaultsCard = () => {
  const [slotsFaults, setSlotsFaults] = useState([]);
  const [gatesFaults, setGatesFaults] = useState([]);
  const [selectedOption, setSelectedOption] = useState('slotsFaults');

  const [page, setPage] = React.useState(1);
  const rowsPerPage = 2;

  useEffect(() => {
    const handleFaults = async () => {
      try {
        const response = await fetchFaultySlotsGates();
        if (response) {
          setSlotsFaults(response.faultySlots);
          setGatesFaults(response.faultyGates);
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('An error occurred while fetching slot and gate faults:', error);
      }
    };
    handleFaults(); // Fetch faults when the component mounts
  }, []);

  const rows = selectedOption === 'slotsFaults' ? slotsFaults : gatesFaults;

  // Calculate total pages
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Calculate the current rows to display
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = rows.slice(startIndex, endIndex);

  return (
    <Card className='w-full flex flex-col max-w-md min-h-56  bg-gray-100  dark:bg-neutral-800'>
      <CardBody>
        <h4 className='text-red-600 font-semibold text-lg text-center mb-4'>Faults</h4>
        <Select
          aria-label='Select fault type'
          size='sm'
          isRequired
          placeholder='Choose gates or slots'
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)} // Ensure correct value assignment
          className='mb-4'
        >
          <SelectItem key='slotsFaults' value='slotsFaults'>
            Slots
          </SelectItem>
          <SelectItem key='gatesFaults' value='gatesFaults'>
            Gates
          </SelectItem>
        </Select>

        <Table
          removeWrapper
          aria-label='Example table with dynamic content '
          bottomContent={
            <div className='flex w-full justify-center'>
              <Pagination isCompact showControls showShadow color='primary' page={page} total={totalPages} onChange={(page) => setPage(page)} />
            </div>
          }
        >
          <TableHeader columns={selectedOption === 'slotsFaults' ? slotsColumns : gatesColumns}>
            {(column) => (
              <TableColumn className='bg-gray-300 dark:bg-zinc-700' key={column.key}>
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody className='' items={paginatedRows}>
            {(item) => (
              <TableRow key={selectedOption === 'slotsFaults' ? item.idSlots : item.idGates}>
                {(columnKey) => <TableCell>{item[columnKey]}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

const slotsColumns = [
  {
    key: 'CityName',
    label: 'City Name'
  },
  {
    key: 'AreaName',
    label: 'Area Name'
  },
  {
    key: 'idSlots',
    label: 'Slot ID'
  }
];

const gatesColumns = [
  {
    key: 'CityName',
    label: 'City Name'
  },
  {
    key: 'idGates',
    label: 'Gate ID'
  }
];
