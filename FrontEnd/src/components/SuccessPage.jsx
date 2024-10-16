import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardBody, Button } from '@nextui-org/react';
import axios from 'axios';

const SuccessPage = () => {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get('session_id');

  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/users`,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get(`/sessions/${sessionId}`);
        setSession(response.data);
      } catch (error) {
        console.error('Error fetching session:', error);
        setError('Failed to fetch session details.');
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!session) {
    return <div>Loading...</div>;
  }

  // Extract relevant invoice details
  const { customer_details, amount_total, currency, status, invoice, subscription } = session;

  return (
    <div className='flex justify-center items-center min-h-screen p-4'>
      <Card className='w-full max-w-lg shadow-lg'>
        <CardBody className='p-6'>
          <h1 className='text-2xl font-bold text-center mb-4 text-green-500'>Payment Successful</h1>

          <div className='mb-4'>
            <h3 className='font-semibold'>Customer Information:</h3>
            <p>Name: {customer_details.name}</p>
            <p>Email: {customer_details.email}</p>
            <p>Phone: {customer_details.phone || 'N/A'}</p>
            <p>
              Address:{' '}
              {customer_details.address
                ? `${customer_details.address.line1}, ${customer_details.address.city}, ${customer_details.address.country}`
                : 'N/A'}
            </p>
          </div>

          <div className='mb-4'>
            <h3 className='font-semibold'>Payment Details:</h3>
            <p>
              Total Amount: {amount_total / 100} {currency.toUpperCase()}
            </p>
            <p>Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p>
          </div>

          <div className='mb-4'>
            <h3 className='font-semibold'>Invoice Information:</h3>
            <p>Invoice ID: {invoice}</p>
            <p>Subscription ID: {subscription}</p>
          </div>

          <div className='text-center'>
            <Button as='a' href='/UserDashboard' color='primary' className='mt-4'>
              Return to Dashboard
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SuccessPage;
