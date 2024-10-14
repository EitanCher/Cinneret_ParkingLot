import React, { useState, useEffect } from 'react';
import { Input, Button } from '@nextui-org/react';
import { addCar } from '../../../api/userApi'; // Your API call to add the car

export const AddCar = ({ userData }) => {
  // State for the car details
  const [registrationID, setRegistrationID] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle form submission
  const handleOnSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page
    setError('');
    setSuccess('');

    try {
      const result = await addCar(registrationID, model);

      // If successful, show the success message
      setSuccess('Car added successfully!');
      setRegistrationID('');
      setModel('');
    } catch (err) {
      // Handle errors and display the error message
      console.error('Error adding car:', err);
      setError('Failed to add car. Please check the details and try again.');
    }
  };

  // Debugging user data if needed
  useEffect(() => {
    console.log('User data:', userData);
  }, [userData]);

  return (
    <div className='flex items-center justify-center bg-white dark:bg-neutral-900'>
      <div className='p-6 md:p-10 rounded-2xl my-20 bg-white dark:bg-neutral-900 flex flex-col gap-4 w-full max-w-md'>
        <h4 className='text-center text-xl font-semibold'>Add a Car</h4>

        <form className='flex flex-col gap-4' onSubmit={handleOnSubmit}>
          {/* Input for RegistrationID */}
          <Input
            type='text'
            variant='underlined'
            size='sm'
            label='Registration ID'
            placeholder='Enter car registration ID'
            value={registrationID}
            onChange={(e) => setRegistrationID(e.target.value)}
            required
          />

          {/* Input for Model */}
          <Input
            type='text'
            variant='underlined'
            size='sm'
            label='Model'
            placeholder='Enter car model'
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />

          {/* Submit Button */}
          <Button type='submit' color='primary'>
            Add Car
          </Button>
        </form>

        {/* Display error or success messages */}
        {error && <p className='text-red-500 text-center'>{error}</p>}
        {success && <p className='text-green-500 text-center'>{success}</p>}
      </div>
    </div>
  );
};
