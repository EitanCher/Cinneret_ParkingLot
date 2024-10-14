import React, { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { addGateToCity } from '@/api/adminApi';

export const AddGates = ({ selectedCity, setGates }) => {
  const [gateDetails, setGateDetails] = useState({
    CameraIP: '',
    GateIP: '',
    CityID: selectedCity?.idCities || ''
  });
  const [loading, setLoading] = useState(false); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors
  const [success, setSuccess] = useState(null); // State to handle success message

  const handleIndividualGateChange = (key, value) => {
    setGateDetails((prevDetails) => ({
      ...prevDetails,
      [key]: value
    }));
  };

  const handleAddIndividualGate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call the API to add the gate to the city
      const result = await addGateToCity(gateDetails.CityID, gateDetails.CameraIP, gateDetails.GateIP);
      console.log('Gate added successfully:', result);

      // Update the gates state to include the new gate
      setGates((prevGates) => [...prevGates, result.gate]);

      // Handle success
      setSuccess('Gate added successfully');
    } catch (error) {
      console.error('Error adding gate:', error);
      setError('Failed to add gate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full h-full'>
      <div className='w-full h-full overflow-hidden'>
        <div className='p-4'>
          <h4 className='dark:text-[#f7fafc] font-semibold text-lg text-center mb-4'>Add Gate to {selectedCity?.CityName || 'Placeholder City'}</h4>

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

            <div className='col-span-1 md:col-span-2 flex justify-center'>
              <Button onClick={handleAddIndividualGate} color='primary' disabled={loading}>
                {loading ? 'Adding...' : 'Add Gate'}
              </Button>
            </div>

            {/* Success and error messages */}
            <div className='col-span-1 md:col-span-2 flex justify-center mt-4'>
              {error && <p className='text-red-500 text-center'>{error}</p>}
              {success && <p className='text-green-500 text-center'>{success}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
