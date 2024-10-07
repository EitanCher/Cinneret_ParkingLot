import React, { useState } from 'react';
import { Card, CardBody, Input, Switch, Button, Tabs, Tab } from '@nextui-org/react';

export const AddGates = ({ selectedCity }) => {
  const [gateDetails, setGateDetails] = useState({
    Entrance: false,
    Fault: false,
    CameraIP: '',
    GateIP: '',
    CityID: selectedCity?.idCities || ''
  });

  const [bulkGateCount, setBulkGateCount] = useState('');
  const [bulkCityID, setBulkCityID] = useState('');

  const handleIndividualGateChange = (key, value) => {
    setGateDetails((prevDetails) => ({
      ...prevDetails,
      [key]: value
    }));
  };

  const handleAddIndividualGate = () => {
    console.log('Adding individual gate:', gateDetails);
  };

  const handleAddBulkGates = () => {
    console.log(`Adding ${bulkGateCount} gates to City ID: ${bulkCityID}`);
  };

  return (
    <div className='w-full h-full'>
      <div className='w-full h-full overflow-hidden'>
        <div className='p-4'>
          <h4 className='dark:text-[#f7fafc] font-semibold text-lg text-center mb-4'>Add Gates to {selectedCity?.CityName || 'Placeholder City'}</h4>

          <Tabs aria-label='Add Gate Options' className='mb-8 flex justify-center'>
            <Tab key='individual' title='Add Individual Gate'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 p-4'>
                <div>
                  <Input
                    label='Camera IP'
                    placeholder='Enter Camera IP'
                    value={gateDetails.CameraIP}
                    onChange={(e) => handleIndividualGateChange('CameraIP', e.target.value)}
                    className='w-full'
                  />
                </div>
                <div>
                  <Input
                    label='Gate IP'
                    placeholder='Enter Gate IP'
                    value={gateDetails.GateIP}
                    onChange={(e) => handleIndividualGateChange('GateIP', e.target.value)}
                    className='w-full'
                  />
                </div>
                <div>
                  <Input
                    type='number'
                    label='City ID'
                    placeholder='Enter City ID'
                    value={gateDetails.CityID}
                    onChange={(e) => handleIndividualGateChange('CityID', parseInt(e.target.value, 10))}
                    className='w-full'
                  />
                </div>

                <div className='flex items-center gap-4'>
                  <span>Entrance</span>
                  <Switch checked={gateDetails.Entrance} onChange={(e) => handleIndividualGateChange('Entrance', e.target.checked)} />
                </div>
                <div className='flex items-center gap-4'>
                  <span>Fault</span>
                  <Switch checked={gateDetails.Fault} onChange={(e) => handleIndividualGateChange('Fault', e.target.checked)} />
                </div>

                <div className='col-span-1 md:col-span-2 flex justify-center'>
                  <Button onClick={handleAddIndividualGate} color='primary'>
                    Add Individual Gate
                  </Button>
                </div>
              </div>
            </Tab>

            <Tab key='bulk' title='Add Bulk Gates'>
              <div className='grid grid-cols-1 gap-4 p-4'>
                <div>
                  <Input
                    type='number'
                    label='Number of Gates'
                    placeholder='Enter number of gates to add'
                    value={bulkGateCount}
                    onChange={(e) => setBulkGateCount(e.target.value)}
                    className='w-full'
                  />
                </div>
                <div>
                  <Input
                    type='number'
                    label='City ID'
                    placeholder='Enter City ID to add gates to'
                    value={bulkCityID}
                    onChange={(e) => setBulkCityID(e.target.value)}
                    className='w-full'
                  />
                </div>
                <div className='col-span-1 flex justify-center'>
                  <Button onClick={handleAddBulkGates} color='primary'>
                    Add Bulk Gates
                  </Button>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
