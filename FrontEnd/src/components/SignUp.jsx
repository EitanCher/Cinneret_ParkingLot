import React, { useState } from 'react';
import { Input, Checkbox, Button, Divider } from '@nextui-org/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { validateSignUpForm } from '../utils/validationUtils'; // Import combined validation function
import { useAuth } from '../Context/AuthContext'; // Import useAuth hook

const Signup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [persId, setPersId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const { signUpUser } = useAuth(); // Access signUpUser from context
  const navigate = useNavigate();

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const errorMessage = validateSignUpForm({ persId, firstName, lastName, email, phone, password, confirmPassword });
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    // Proceed with the signup logic
    try {
      await signUpUser(persId, firstName, lastName, email, phone, password); // Use signUpUser from context

      navigate('/'); // Navigate to the UserDashboard after successful signup
    } catch (error) {
      console.error('Signup failed:', error);
      setError('Signup failed. Please check your details and try again.');
    }
  };

  return (
    <div className='flex justify-center min-h-screen my-16'>
      <div className='w-full max-w-lg p-6 md:p-8 flex flex-col items-center rounded-lg'>
        <h1 className='text-2xl font-bold mb-4'>Create Your Account</h1>
        <p className='mb-8 text-sm text-gray-500 text-center'>Fill in the details below to create a new account</p>
        <form onSubmit={handleSignup} className='w-full'>
          <Input
            label='Personal ID'
            variant='underlined'
            placeholder='Enter your personal ID'
            value={persId}
            onChange={(e) => setPersId(e.target.value)}
            className='w-full mb-4'
          />
          <Input
            label='First Name'
            variant='underlined'
            placeholder='Enter your first name'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className='w-full mb-4'
          />
          <Input
            label='Last Name'
            variant='underlined'
            placeholder='Enter your last name'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className='w-full mb-4'
          />
          <Input
            type='email'
            label='Email'
            variant='underlined'
            placeholder='Enter your email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full mb-4'
          />
          <Input
            type='tel'
            label='Phone'
            variant='underlined'
            placeholder='Enter your phone number'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className='w-full mb-4'
          />
          <Input
            label='Password'
            placeholder='Enter your password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endContent={
              <button type='button' onClick={toggleVisibility} aria-label='toggle password visibility' className='focus:outline-none'>
                {isVisible ? <FaEyeSlash className='text-2xl text-default-400' /> : <FaEye className='text-2xl text-default-400' />}
              </button>
            }
            type={isVisible ? 'text' : 'password'}
            className='w-full mb-4'
          />
          <Input
            label='Confirm Password'
            placeholder='Confirm your password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            endContent={
              <button type='button' onClick={toggleVisibility} aria-label='toggle password visibility' className='focus:outline-none'>
                {isVisible ? <FaEyeSlash className='text-2xl text-default-400' /> : <FaEye className='text-2xl text-default-400' />}
              </button>
            }
            type={isVisible ? 'text' : 'password'}
            className='w-full mb-4'
          />
          <div className='flex items-center justify-between mb-4'>
            <Checkbox defaultChecked>
              I agree with the <span className='text-blue-500 hover:underline'> Terms</span> and{' '}
              <span className='text-blue-500 hover:underline'>Privacy Policy</span>{' '}
            </Checkbox>
          </div>
          <Button type='submit' className='w-full mb-6' color='primary'>
            Sign Up
          </Button>
          {error && <p className='text-red-500 mb-4'>{error}</p>}
          <div className='flex items-center justify-center w-full mb-4'>
            <Divider className='flex-1' />
            <span className='px-4 text-gray-500 text-xs'>OR</span>
            <Divider className='flex-1' />
          </div>

          <p className='flex items-center justify-center text-sm text-gray-500 mt-4'>
            Already have an account? <span className='px-1' />
            <Link to='/login' className='text-blue-500 hover:underline'>
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
