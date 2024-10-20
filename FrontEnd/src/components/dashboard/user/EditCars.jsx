import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Pagination, Card, Input } from '@nextui-org/react';
import { getUserCars, updateCar, deleteCar } from '@/api/userApi'; // Import deleteCar

export const EditCars = () => {
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [editingCars, setEditingCars] = useState({});
  const [cars, setCars] = useState([]); // State to hold the fetched cars
  const rowsPerPage = 5;

  // Fetch and initialize car data
  useEffect(() => {
    const getCarInfo = async () => {
      try {
        const fetchedCars = await getUserCars();
        setCars(fetchedCars);
        console.log('Fetched cars:', fetchedCars);

        // Initialize editing state based on fetched cars
        const initialEditingState = {};
        fetchedCars.forEach((car) => {
          initialEditingState[car.idCars] = {
            RegistrationID: car.RegistrationID,
            Model: car.Model
          };
        });
        setEditingCars(initialEditingState);
      } catch (error) {
        console.error('Error fetching user cars:', error);
        setErrorMessage('Failed to fetch cars.');
      }
    };

    getCarInfo();
  }, []);

  // Handle input change and update the local editingCars state
  const handleInputChange = (idCars, key, value) => {
    setEditingCars((prev) => ({
      ...prev,
      [idCars]: { ...prev[idCars], [key]: value }
    }));
  };

  // Handle the "Save" button click for editing a car
  const handleEdit = async (idCars) => {
    try {
      const updatedCarData = editingCars[idCars];
      await updateCar(idCars, updatedCarData); // Call the API to update the car
      setSuccessMessage(`Car with ID: ${idCars} updated successfully.`);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error updating car:', error);
      setErrorMessage(`Failed to update car with ID: ${idCars}`);
      setSuccessMessage(null);
    }
  };

  // Handle the "Delete" button click for deleting a car
  const handleDelete = async (idCars) => {
    try {
      await deleteCar(idCars); // Call the API to delete the car
      setCars((prevCars) => prevCars.filter((car) => car.idCars !== idCars)); // Remove the deleted car from state
      setSuccessMessage(`Car with ID: ${idCars} deleted successfully.`);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error deleting car:', error);
      setErrorMessage(`Failed to delete car with ID: ${idCars}`);
      setSuccessMessage(null);
    }
  };

  // Calculate total pages based on the cars data
  const totalRows = cars.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Get cars for the current page
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCars = cars.slice(startIndex, endIndex);

  return (
    <div className='w-full h-full'>
      <div className='w-full h-full overflow-hidden'>
        <div className='p-4'>
          <h4 className='dark:text-[#f7fafc] font-semibold text-lg text-center mb-4'>Manage Cars</h4>

          <Card className='overflow-x-auto'>
            <Table removeWrapper aria-label='Cars Management Table' className='w-full min-h-44'>
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>Registration ID</TableColumn>
                <TableColumn>Model</TableColumn>
                <TableColumn className='text-center'>Edit</TableColumn>
                <TableColumn className='text-center'>Delete</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedCars.map((car) => (
                  <TableRow key={car.idCars}>
                    <TableCell>{car.idCars}</TableCell>
                    <TableCell>
                      <Input
                        value={editingCars[car.idCars]?.RegistrationID || ''}
                        onChange={(e) => handleInputChange(car.idCars, 'RegistrationID', e.target.value)}
                        aria-label='Registration ID'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editingCars[car.idCars]?.Model || ''}
                        onChange={(e) => handleInputChange(car.idCars, 'Model', e.target.value)}
                        aria-label='Model'
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-center'>
                        <Button color='primary' auto onClick={() => handleEdit(car.idCars)}>
                          Save
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-center'>
                        <Button color='danger' auto onClick={() => handleDelete(car.idCars)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className='flex w-full justify-center mt-4'>
            <Pagination isCompact showControls showShadow color='primary' page={page} total={totalPages} onChange={(page) => setPage(page)} />
          </div>

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
