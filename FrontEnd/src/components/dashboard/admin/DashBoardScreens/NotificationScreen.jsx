import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Textarea, Button, Input, Select, SelectItem } from '@nextui-org/react';
import { postNotification, createParkingLotNotification } from '@/api/adminApi';
import { fetchCities } from '@/api/userApi';

export const NotificationScreen = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [parkingLot, setParkingLot] = useState(''); // This will hold the cityId
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const { cities } = await fetchCities();
        setParkingLots(cities);
      } catch (error) {
        console.error('Error fetching parking lots:', error);
      }
    };
    fetchParkingLots();
  }, []);

  const handleSendGlobalNotification = async () => {
    if (!title || !message) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await postNotification(title, message, true); // Send global notification
      setSuccess(true);
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendParkingLotNotification = async () => {
    if (!title || !message || !parkingLot) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createParkingLotNotification(parkingLot, title, message);
      setSuccess(true);
      setTitle('');
      setMessage('');
      setParkingLot('');
    } catch (error) {
      console.error('Error sending parking lot notification:', error);
      setError('Failed to send parking lot notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-1 h-full'>
      <div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full'>
        <div className='flex w-full flex-col'>
          <Tabs variant='bordered' className='justify-center mb-6' aria-label='Notification Tabs'>
            <Tab title='Send to Everyone'>
              <div className='flex flex-col gap-6 w-full max-w-4xl mx-auto'>
                <Input
                  isRequired
                  variant='bordered'
                  labelPlacement='outside'
                  placeholder='Enter your title here...'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  isRequired
                  variant='bordered'
                  labelPlacement='outside'
                  placeholder='Enter your message here...'
                  className='resize-none'
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button color='primary' className='w-32 self-center' onClick={handleSendGlobalNotification} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Notification'}
                </Button>
                {success && <p className='text-green-600 text-center'>Notification sent successfully!</p>}
                {error && <p className='text-red-600 text-center'>{error}</p>}
              </div>
            </Tab>

            <Tab title='Send to Parking Lot'>
              <div className='flex flex-col gap-6 w-full max-w-4xl mx-auto'>
                <Select
                  label='Select Parking Lot'
                  placeholder='Choose a parking lot'
                  value={parkingLot}
                  onChange={(e) => setParkingLot(e.target.value)} // Extract the value directly
                >
                  {parkingLots.map((lot) => (
                    <SelectItem key={lot.idCities} value={lot.idCities}>
                      {lot.CityName}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  variant='bordered'
                  labelPlacement='outside'
                  placeholder='Enter your title here...'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  variant='bordered'
                  labelPlacement='outside'
                  placeholder='Enter your message here...'
                  className='resize-none'
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button color='primary' className='w-32 self-center' onClick={handleSendParkingLotNotification} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Notification'}
                </Button>
                {success && <p className='text-green-600 text-center'>Notification sent successfully!</p>}
                {error && <p className='text-red-600 text-center'>{error}</p>}
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NotificationScreen;
