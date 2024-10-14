import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Pagination, Input, Switch } from '@nextui-org/react';
import { getGatesByCity, deleteGateById, editGateById } from '@/api/adminApi';

export const UpdateGates = ({ selectedCity, gates, setGates }) => {
  const [page, setPage] = useState(1);
  const [editingGates, setEditingGates] = useState({});
  const rowsPerPage = 5;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // State for success message
  const [errorMessage, setErrorMessage] = useState(null); // State for error message

  const fetchGates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getGatesByCity(selectedCity?.idCities);
      setGates(response.gates);
    } catch (err) {
      console.error('Error fetching gates:', err);
      setError('Failed to fetch gates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCity?.idCities) {
      fetchGates();
    }
  }, [selectedCity]);

  useEffect(() => {
    if (gates && Array.isArray(gates)) {
      const initialEditingState = {};
      gates.forEach((gate) => {
        initialEditingState[gate.idGates] = {
          Entrance: gate.Entrance ?? false,
          Fault: gate.Fault ?? false,
          CameraIP: gate.CameraIP || '', // Default to an empty string
          GateIP: gate.GateIP || '', // Default to an empty string
          CityID: gate.CityID || '' // Default to an empty string
        };
      });
      setEditingGates(initialEditingState);
    }
  }, [gates]);

  const handleInputChange = (idGates, key, value) => {
    setEditingGates((prev) => ({
      ...prev,
      [idGates]: { ...prev[idGates], [key]: value }
    }));
  };

  const handleDelete = async (idGates) => {
    try {
      await deleteGateById(idGates);
      setGates((prevGates) => prevGates.filter((gate) => gate.idGates !== idGates));
      setSuccessMessage(`Gate with ID: ${idGates} deleted successfully.`);
      setErrorMessage(null); // Clear error message if delete is successful
    } catch (error) {
      console.error('Failed to delete gate:', error);
      setErrorMessage(`Failed to delete gate with ID: ${idGates}`);
      setSuccessMessage(null); // Clear success message on error
    }
  };

  const handleEdit = async (idGates) => {
    const updatedData = editingGates[idGates];

    // Check if required fields are missing
    if (!updatedData.CameraIP || !updatedData.GateIP || !updatedData.CityID) {
      setErrorMessage('Camera IP, Gate IP, and City ID are required.');
      setSuccessMessage(null); // Clear success message
      return;
    }

    try {
      await editGateById(idGates, updatedData);
      setGates((prev) => prev.map((gate) => (gate.idGates === idGates ? { ...gate, ...updatedData } : gate)));
      setSuccessMessage(`Gate with ID: ${idGates} updated successfully.`);
      setErrorMessage(null); // Clear error message if update is successful
    } catch (error) {
      // Extract the error message returned from the server
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message); // Display specific error
      } else {
        setErrorMessage(`Failed to update gate with ID: ${idGates}`);
      }
      setSuccessMessage(null); // Clear success message on error
    }
  };

  const totalRows = gates.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedGates = gates.slice(startIndex, endIndex);

  return (
    <div className='w-full h-full'>
      <div className='w-full h-full overflow-hidden'>
        <div className='p-4'>
          <h4 className='dark:text-[#f7fafc] font-semibold text-lg text-center mb-4'>
            Manage Gates in {selectedCity?.CityName || 'Placeholder City'}
          </h4>

          {loading && <p className='text-center'>Loading gates...</p>}
          {error && <p className='text-center text-red-500'>{error}</p>}

          {!loading && !error && (
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
                          isSelected={editingGates[gate.idGates]?.Entrance ?? false}
                          onValueChange={(e) => handleInputChange(gate.idGates, 'Entrance', e)}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          isSelected={editingGates[gate.idGates]?.Fault ?? false}
                          onValueChange={(e) => handleInputChange(gate.idGates, 'Fault', e)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editingGates[gate.idGates]?.CameraIP || ''}
                          onChange={(e) => handleInputChange(gate.idGates, 'CameraIP', e.target.value)}
                          aria-label='Camera IP'
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editingGates[gate.idGates]?.GateIP || ''}
                          onChange={(e) => handleInputChange(gate.idGates, 'GateIP', e.target.value)}
                          aria-label='Gate IP'
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type='number'
                          value={editingGates[gate.idGates]?.CityID || ''}
                          onChange={(e) => handleInputChange(gate.idGates, 'CityID', parseInt(e.target.value, 10))}
                          aria-label='City ID'
                          required
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
          )}

          {totalPages > 1 && (
            <div className='flex w-full justify-center mt-4'>
              <Pagination isCompact showControls showShadow color='primary' page={page} total={totalPages} onChange={(page) => setPage(page)} />
            </div>
          )}

          {/* Display success or error message */}
          <div className='mt-4'>
            {successMessage && <p className='text-green-500 text-center'>{successMessage}</p>}
            {errorMessage && <p className='text-red-500 text-center'>{errorMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
