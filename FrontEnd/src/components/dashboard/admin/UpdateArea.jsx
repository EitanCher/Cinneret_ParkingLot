import React, { useState } from 'react';
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Pagination, Input } from '@nextui-org/react';
import { deleteArea, editArea } from '@/api/adminApi';

export const UpdateArea = ({ selectedCity, areas, setAreas }) => {
  const [page, setPage] = useState(1);
  const [editingNames, setEditingNames] = useState({}); // State to track editing names
  const rowsPerPage = 5;

  const handleDelete = async (idAreas) => {
    try {
      await deleteArea(idAreas);
      console.log('Deleted area:', idAreas);
      // Update areas after deletion
      setAreas(areas.filter((a) => a.idAreas !== idAreas));
    } catch (error) {
      console.error('Failed to delete area:', error);
    }
  };

  const handleUpdate = async (idAreas) => {
    try {
      const updatedArea = await editArea(idAreas, editingNames[idAreas]);
      console.log('Updated area:', updatedArea);
      // Update the area in the parent state
      const updatedAreas = areas.map((a) => (a.idAreas === updatedArea.idAreas ? updatedArea : a));
      setAreas(updatedAreas);
    } catch (error) {
      console.error('Failed to update area:', error);
    }
  };

  // Handle input change and update the local editingNames state
  const handleInputChange = (idAreas, newAreaName) => {
    setEditingNames((prev) => ({
      ...prev,
      [idAreas]: newAreaName
    }));
  };

  // Calculate total pages
  const totalRows = areas.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Get areas for the current page
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAreas = areas.slice(startIndex, endIndex);

  return (
    <Card className='w-full min-h-96 max-w-[700px]'>
      <CardBody>
        <h4 className=' dark:text-[#f7fafc] font-semibold text-lg text-center mb-4'>Manage Areas in {selectedCity.CityName}</h4>

        <Table removeWrapper aria-label='Area Management Table'>
          <TableHeader>
            <TableColumn>Area Name</TableColumn>
            <TableColumn className='text-center'>Edit</TableColumn>
            <TableColumn className='text-center'>Delete</TableColumn>
          </TableHeader>
          <TableBody>
            {paginatedAreas.map((area) => (
              <TableRow key={area.idAreas}>
                <TableCell>
                  <Input
                    value={editingNames[area.idAreas] ?? area.AreaName} // Use editingNames if available, otherwise use AreaName
                    onChange={(e) => handleInputChange(area.idAreas, e.target.value)} // Track input changes per area
                    aria-label='Area Name'
                    className='-ml-2'
                  />
                </TableCell>
                <TableCell>
                  <div className='flex justify-center'>
                    <Button color='primary' onClick={() => handleUpdate(area.idAreas)} auto>
                      Edit
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex justify-center'>
                    <Button color='danger' auto onClick={() => handleDelete(area.idAreas)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='flex w-full justify-center mt-4'>
          <Pagination isCompact showControls showShadow color='primary' page={page} total={totalPages} onChange={(page) => setPage(page)} />
        </div>
      </CardBody>
    </Card>
  );
};
