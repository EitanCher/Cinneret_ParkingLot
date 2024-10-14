import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Pagination, Input, Switch } from '@nextui-org/react';
import { deleteSlotByID, updateIndividualSlot } from '@/api/adminApi';

export const UpdateSlots = ({ selectedCity, slots, setSlots }) => {
  const [page, setPage] = useState(1);
  const [editingSlots, setEditingSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null); // State for success message
  const [errorMessage, setErrorMessage] = useState(null); // State for error message
  const rowsPerPage = 5;

  // Initialize the editingSlots state based on fetched slots
  useEffect(() => {
    const initialEditingState = {};
    slots.forEach((slot) => {
      initialEditingState[slot.idSlots] = {
        Busy: slot.Busy,
        BorderRight: slot.BorderRight,
        Active: slot.Active,
        Fault: slot.Fault,
        AreaID: slot.AreaID,
        CameraIP: slot.CameraIP,
        SlotIP: slot.SlotIP
      };
    });
    setEditingSlots(initialEditingState);
  }, [slots]);

  // Handle input change and update the local editingSlots state
  const handleInputChange = (idSlots, key, value) => {
    setEditingSlots((prev) => ({
      ...prev,
      [idSlots]: { ...prev[idSlots], [key]: value }
    }));
  };

  // Handle deletion of a slot
  const handleDelete = async (idSlots) => {
    try {
      await deleteSlotByID(idSlots);
      setSlots((prevSlots) => prevSlots.filter((slot) => slot.idSlots !== idSlots));
      setSuccessMessage(`Slot with ID ${idSlots} deleted successfully.`);
      setErrorMessage(null); // Clear error message if successful
    } catch (error) {
      console.error('Failed to delete slot:', error);
      setErrorMessage(`Failed to delete slot with ID ${idSlots}.`);
      setSuccessMessage(null); // Clear success message on error
    }
  };

  // Handle updating a slot
  const handleEdit = async (idSlots) => {
    const updatedData = editingSlots[idSlots];

    try {
      await updateIndividualSlot(idSlots, updatedData);
      setSlots((prev) => prev.map((slot) => (slot.idSlots === idSlots ? { ...slot, ...updatedData } : slot)));
      setSuccessMessage(`Slot with ID ${idSlots} updated successfully.`);
      setErrorMessage(null); // Clear error message if successful
    } catch (error) {
      console.error('Failed to update slot:', error);
      setErrorMessage(`Failed to update slot with ID ${idSlots}.`);
      setSuccessMessage(null); // Clear success message on error
    }
  };

  // Calculate total pages based on the slots data
  const totalRows = slots.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Get slots for the current page using fetched data
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedSlots = slots.slice(startIndex, endIndex);

  return (
    <div className='w-full h-full'>
      <div className='w-full h-full overflow-hidden'>
        <div className='p-4'>
          <h4 className='dark:text-[#f7fafc] font-semibold text-lg text-center mb-4'>
            Manage Slots in {selectedCity?.CityName || 'Placeholder City'}
          </h4>

          <div className='overflow-x-auto w-full'>
            <Table removeWrapper aria-label='Slots Management Table' className='w-full min-h-44'>
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>Busy</TableColumn>
                <TableColumn className='max-w-20'>Border Right</TableColumn>
                <TableColumn>Active</TableColumn>
                <TableColumn>Fault</TableColumn>
                <TableColumn className='min-w-20'>Area ID</TableColumn>
                <TableColumn className='min-w-36'>Camera IP</TableColumn>
                <TableColumn className='min-w-36'>Slot IP</TableColumn>
                <TableColumn className='text-center'>Edit</TableColumn>
                <TableColumn className='text-center'>Delete</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedSlots.map((slot) => (
                  <TableRow key={slot.idSlots}>
                    <TableCell>{slot.idSlots}</TableCell>
                    <TableCell>
                      <Switch
                        isSelected={editingSlots[slot.idSlots]?.Busy ?? slot.Busy}
                        onValueChange={(e) => handleInputChange(slot.idSlots, 'Busy', e)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type='number'
                        value={editingSlots[slot.idSlots]?.BorderRight ?? slot.BorderRight}
                        onChange={(e) => handleInputChange(slot.idSlots, 'BorderRight', parseInt(e.target.value, 10))}
                        aria-label='Border Right'
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        isSelected={editingSlots[slot.idSlots]?.Active ?? slot.Active}
                        onValueChange={(e) => handleInputChange(slot.idSlots, 'Active', e)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        isSelected={editingSlots[slot.idSlots]?.Fault ?? slot.Fault}
                        onValueChange={(e) => handleInputChange(slot.idSlots, 'Fault', e)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type='number'
                        value={editingSlots[slot.idSlots]?.AreaID ?? slot.AreaID}
                        onChange={(e) => handleInputChange(slot.idSlots, 'AreaID', parseInt(e.target.value, 10))}
                        aria-label='Area ID'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editingSlots[slot.idSlots]?.CameraIP ?? slot.CameraIP}
                        onChange={(e) => handleInputChange(slot.idSlots, 'CameraIP', e.target.value)}
                        aria-label='Camera IP'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editingSlots[slot.idSlots]?.SlotIP ?? slot.SlotIP}
                        onChange={(e) => handleInputChange(slot.idSlots, 'SlotIP', e.target.value)}
                        aria-label='Slot IP'
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-center'>
                        <Button color='primary' auto onClick={() => handleEdit(slot.idSlots)}>
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-center'>
                        <Button color='danger' auto onClick={() => handleDelete(slot.idSlots)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
