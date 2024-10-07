import React, { useState, useEffect } from 'react';
import { Card, CardBody, Input, Switch, Button } from '@nextui-org/react';
import { Tabs, Tab } from '@nextui-org/react';
import { addIndividualSlot, addSlotsToArea } from '@/api/adminApi'; // Import the API functions

export const AddSlots = ({ selectedCity, slots, setSlots }) => {
  const [slotDetails, setSlotDetails] = useState({
    Busy: false,
    BorderRight: '',
    Active: true,
    Fault: false,
    AreaID: '',
    CameraIP: '',
    SlotIP: ''
  });
  const [bulkSlotCount, setBulkSlotCount] = useState('');
  const [bulkAreaID, setBulkAreaID] = useState('');

  useEffect(() => {}, [selectedCity]);

  const handleAddIndividualSlot = async () => {
    try {
      const sanitizedSlotDetails = {
        ...slotDetails,
        AreaID: parseInt(slotDetails.AreaID, 10),
        BorderRight: parseInt(slotDetails.BorderRight, 10)
      };

      console.log('Adding individual slot:', sanitizedSlotDetails);
      const addedSlot = await addIndividualSlot(sanitizedSlotDetails);

      console.log('Successfully added individual slot:', addedSlot);
      setSlots((prevSlots) => [...prevSlots, addedSlot]);

      setSlotDetails({
        Busy: false,
        BorderRight: '',
        Active: true,
        Fault: false,
        AreaID: '',
        CameraIP: '',
        SlotIP: ''
      });
    } catch (error) {
      console.error('Failed to add individual slot:', error);
    }
  };

  const handleAddBulkSlots = async () => {
    try {
      const areaId = parseInt(bulkAreaID, 10);
      const numOfSlots = parseInt(bulkSlotCount, 10);

      if (!areaId || numOfSlots <= 0) {
        alert('Please provide a valid Area ID and a positive number of slots to add.');
        return;
      }

      console.log(`Adding ${numOfSlots} slots to Area ID: ${areaId}`);

      // Call the API function to add bulk slots
      const result = await addSlotsToArea(areaId, { numOfSlots });

      console.log(`Successfully added ${numOfSlots} slots to area ${areaId}.`, result);

      //  update the slots state with the newly added slots
      setSlots((prevSlots) => [...prevSlots, ...result]);

      // Clear the bulk slot inputs
      setBulkSlotCount('');
      setBulkAreaID('');
    } catch (error) {
      console.error('Failed to add bulk slots:', error);
      alert('Failed to add bulk slots. Please try again.');
    }
  };

  return (
    <div>
      <div className='w-full h-full'>
        <div className='w-full h-full overflow-hidden'>
          <div className='p-4'>
            <h4 className='dark:text-[#f7fafc] font-semibold text-lg text-center mb-4'>
              Add slots to {selectedCity?.CityName || 'Placeholder City'}
            </h4>

            <Tabs aria-label='Add Slot Options' className='mb-8 flex justify-center'>
              <Tab key='individual' title='Add Individual Slot'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 p-4'>
                  <div>
                    <Input
                      label='Camera IP'
                      placeholder='Enter Camera IP'
                      value={slotDetails.CameraIP}
                      onChange={(e) => setSlotDetails({ ...slotDetails, CameraIP: e.target.value })}
                      className='w-full'
                    />
                  </div>
                  <div>
                    <Input
                      label='Slot IP'
                      placeholder='Enter Slot IP'
                      value={slotDetails.SlotIP}
                      onChange={(e) => setSlotDetails({ ...slotDetails, SlotIP: e.target.value })}
                      className='w-full'
                    />
                  </div>
                  <div>
                    <Input
                      type='number'
                      label='Area ID'
                      placeholder='Enter Area ID'
                      value={slotDetails.AreaID}
                      onChange={(e) => setSlotDetails({ ...slotDetails, AreaID: e.target.value })}
                      className='w-full'
                    />
                  </div>
                  <div>
                    <Input
                      type='number'
                      label='Border Right'
                      placeholder='Enter Border Right Value'
                      value={slotDetails.BorderRight}
                      onChange={(e) => setSlotDetails({ ...slotDetails, BorderRight: e.target.value })}
                      className='w-full'
                    />
                  </div>

                  <div className='flex items-center gap-4'>
                    <span>Busy</span>
                    <Switch checked={slotDetails.Busy} onChange={(e) => setSlotDetails({ ...slotDetails, Busy: e.target.checked })} />
                  </div>
                  <div className='flex items-center gap-4'>
                    <span>Active</span>
                    <Switch checked={slotDetails.Active} onChange={(e) => setSlotDetails({ ...slotDetails, Active: e.target.checked })} />
                  </div>
                  <div className='flex items-center gap-4'>
                    <span>Fault</span>
                    <Switch checked={slotDetails.Fault} onChange={(e) => setSlotDetails({ ...slotDetails, Fault: e.target.checked })} />
                  </div>

                  <div className='col-span-1 md:col-span-2 flex justify-center'>
                    <Button onClick={handleAddIndividualSlot} color='primary'>
                      Add Individual Slot
                    </Button>
                  </div>
                </div>
              </Tab>

              <Tab key='bulk' title='Add Bulk Slots'>
                <div className='grid grid-cols-1 gap-4 p-4'>
                  <div>
                    <Input
                      type='number'
                      label='Number of Slots'
                      placeholder='Enter number of slots to add'
                      value={bulkSlotCount}
                      onChange={(e) => setBulkSlotCount(e.target.value)}
                      className='w-full'
                    />
                  </div>
                  <div>
                    <Input
                      type='number'
                      label='Area ID'
                      placeholder='Enter Area ID to add slots to'
                      value={bulkAreaID}
                      onChange={(e) => setBulkAreaID(e.target.value)}
                      className='w-full'
                    />
                  </div>
                  <div className='col-span-1 flex justify-center'>
                    <Button onClick={handleAddBulkSlots} color='primary'>
                      Add Bulk Slots
                    </Button>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
