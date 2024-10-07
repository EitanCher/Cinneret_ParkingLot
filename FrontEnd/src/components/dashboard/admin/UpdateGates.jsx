import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Pagination, Input, Switch } from '@nextui-org/react';

export const UpdateGates = ({ selectedCity, gates = [], setGates }) => {
  const [page, setPage] = useState(1);
  const [editingGates, setEditingGates] = useState({});
  const rowsPerPage = 5;

  const dummyGates = [
    {
      idGates: 1,
      Entrance: true,
      Fault: false,
      CameraIP: '192.168.1.100',
      GateIP: '192.168.1.101',
      CityID: selectedCity?.idCities || 1
    },
    {
      idGates: 2,
      Entrance: false,
      Fault: true,
      CameraIP: '192.168.1.110',
      GateIP: '192.168.1.111',
      CityID: selectedCity?.idCities || 1
    },
    {
      idGates: 3,
      Entrance: true,
      Fault: false,
      CameraIP: '192.168.1.120',
      GateIP: '192.168.1.121',
      CityID: selectedCity?.idCities || 1
    }
  ];

  const gatesData = gates.length === 0 ? dummyGates : gates;

  useEffect(() => {
    if (gatesData && Array.isArray(gatesData)) {
      const initialEditingState = {};
      gatesData.forEach((gate) => {
        initialEditingState[gate.idGates] = {
          Entrance: gate.Entrance,
          Fault: gate.Fault,
          CameraIP: gate.CameraIP,
          GateIP: gate.GateIP,
          CityID: gate.CityID
        };
      });
      setEditingGates(initialEditingState);
    }
  }, [gatesData]);

  const handleInputChange = (idGates, key, value) => {
    setEditingGates((prev) => ({
      ...prev,
      [idGates]: { ...prev[idGates], [key]: value }
    }));
  };

  const handleDelete = async (idGates) => {
    try {
      console.log(`Deleting gate with ID: ${idGates}`);
      setGates((prevGates) => prevGates.filter((gate) => gate.idGates !== idGates));
    } catch (error) {
      console.error('Failed to delete gate:', error);
      alert(`Failed to delete gate with ID: ${idGates}`);
    }
  };

  const handleEdit = async (idGates) => {
    try {
      const updatedData = editingGates[idGates];
      console.log('Updating gate with data:', updatedData);
      setGates((prev) => prev.map((gate) => (gate.idGates === idGates ? { ...gate, ...updatedData } : gate)));
    } catch (error) {
      console.error('Failed to update gate:', error);
      alert(`Failed to update gate with ID: ${idGates}`);
    }
  };

  const totalRows = gatesData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedGates = gatesData.slice(startIndex, endIndex);

  return (
    <div className='w-full h-full'>
      <div className='w-full h-full overflow-hidden'>
        <div className='p-4'>
          <h4 className='dark:text-[#f7fafc] font-semibold text-lg text-center mb-4'>
            Manage Gates in {selectedCity?.CityName || 'Placeholder City'}
          </h4>

          <div className='overflow-x-auto w-full'>
            <Table removeWrapper aria-label='Gates Management Table' className='w-full'>
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>Entrance</TableColumn>
                <TableColumn>Fault</TableColumn>
                <TableColumn className='min-w-36'>Camera IP</TableColumn>
                <TableColumn className='min-w-36'>Gate IP</TableColumn>
                <TableColumn>City ID</TableColumn>
                <TableColumn className='text-center'>Edit</TableColumn>
                <TableColumn className='text-center'>Delete</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedGates.map((gate) => (
                  <TableRow key={gate.idGates}>
                    <TableCell>{gate.idGates}</TableCell>
                    <TableCell>
                      <Switch
                        isSelected={editingGates[gate.idGates]?.Entrance ?? gate.Entrance}
                        onValueChange={(e) => handleInputChange(gate.idGates, 'Entrance', e)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        isSelected={editingGates[gate.idGates]?.Fault ?? gate.Fault}
                        onValueChange={(e) => handleInputChange(gate.idGates, 'Fault', e)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editingGates[gate.idGates]?.CameraIP ?? gate.CameraIP}
                        onChange={(e) => handleInputChange(gate.idGates, 'CameraIP', e.target.value)}
                        aria-label='Camera IP'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editingGates[gate.idGates]?.GateIP ?? gate.GateIP}
                        onChange={(e) => handleInputChange(gate.idGates, 'GateIP', e.target.value)}
                        aria-label='Gate IP'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type='number'
                        value={editingGates[gate.idGates]?.CityID ?? gate.CityID}
                        onChange={(e) => handleInputChange(gate.idGates, 'CityID', parseInt(e.target.value, 10))}
                        aria-label='City ID'
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-center'>
                        <Button color='primary' auto onClick={() => handleEdit(gate.idGates)}>
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-center'>
                        <Button color='danger' auto onClick={() => handleDelete(gate.idGates)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className='flex w-full justify-center mt-4'>
              <Pagination isCompact showControls showShadow color='primary' page={page} total={totalPages} onChange={(page) => setPage(page)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
