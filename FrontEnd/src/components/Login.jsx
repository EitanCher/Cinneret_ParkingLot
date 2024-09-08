import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '../Context/authContext'; // Ensure all imports use this path
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Input, Checkbox, Button, Divider } from '@nextui-org/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc'; // Import colorful Google icon
import axios from 'axios';
const Login = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { loginUser } = useAuth(); // Access loginUser from context
  const navigate = useNavigate(); // Initialize useNavigate

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_CALLBACK_URL);
    const scope = 'profile email';
    const responseType = 'code';

    if (!clientId) {
      console.error('Google Client ID is not set. Check your environment variables.');
      return;
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    window.location.replace(googleAuthUrl); // Using replace instead of href
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if email is empty or does not match regex
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    console.log('Attempting login with', email, password); // Debug login inputs
    try {
      const userData = await loginUser(email, password); // Use loginUser to handle login
      if (userData) {
        console.log('Login successful, user data:', userData); // Check if userData is correctly logged
        navigate('/'); // Navigate to the homepage or another page upon successful login
      } else {
        setError('Invalid email or password. Please try again.');
        console.log('Invalid email or password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className='flex justify-center min-h-screen my-16'>
      {/* Centers both vertically and horizontally */}
      <div className='w-full max-w-sm bg-white p-6 md:p-0  flex flex-col items-center'>
        {/* Invisible container with size matching NextUI Card */}
        <svg
          viewBox='0 0 48 48'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='w-8 h-8 text-[#111118] mb-4' // Adjust size and margin as needed
        >
          <path d='M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z' fill='currentColor'></path>
        </svg>
        <h1 className='text-xl font-sans  text-center  '>Welcome Back</h1>
        <p className='mb-8 text-sm font-normal  text-gray-500 text-center'>Login to your account to continue</p>
        <form onSubmit={handleLogin} className='w-full'>
          <Input
            isClearable
            type='email'
            label='Email'
            variant='underlined'
            placeholder='Enter your email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full mb-4'
          />
          <Input
            label='Password'
            variant='underlined'
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
          <div className='flex items-center justify-between mb-4'>
            <Checkbox defaultSelected>Remember me</Checkbox>
            <a href='#' className='text-blue-500 hover:underline'>
              Forgot password?
            </a>
          </div>
          <Button type='submit' className='w-full mb-6' color='primary'>
            Log In
          </Button>
          {error && <p className='text-red-500 mb-4'>{error}</p>} {/* Display error message if login fails */}
          <div className='flex items-center justify-center w-full mb-4'>
            <Divider className='flex-1' />
            <span className='px-4 text-gray-500 text-xs'>OR</span>
            <Divider className='flex-1' />
          </div>
          <Button className='w-full flex items-center justify-center bg-white text-black border border-gray-300' onClick={handleGoogleLogin}>
            <FcGoogle className='mr-2' /> Continue with Google
          </Button>
          <p className='flex items-center justify-center  text-sm text-gray-500 mt-4'>
            Need to create an account?{' '}
            <Link to='/sign-up' className='text-blue-500 hover:underline'>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
