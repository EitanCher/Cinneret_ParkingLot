import React, { useState } from 'react';
import { Textarea, Button } from '@nextui-org/react';
import { postNotification } from '@/api/adminApi'; // Already imported

export const NotificationScreen = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSendNotification = async () => {
    if (!message) return; // Prevent sending empty messages

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Use the imported postNotification function instead of axios
      await postNotification(message, true); // Assuming it's a global notification
      setSuccess(true);
      setMessage(''); // Clear the textarea after successful submission
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-1 h-full'>
      <div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full justify-center items-center'>
        <div className='p-6 rounded-2xl bg-white dark:bg-neutral-900 flex flex-col items-center gap-4 w-full max-w-2xl'>
          <h4 className='text-center text-xl font-semibold'>Send a Notification</h4>
          <Textarea
            variant='bordered'
            labelPlacement='outside'
            placeholder='Enter your message here...'
            className='resize-none'
            rows={6} // Adjust the number of visible rows for height
            value={message}
            onChange={(e) => setMessage(e.target.value)} // Update state on input change
          />
          <Button
            color='primary'
            className='w-32'
            onClick={handleSendNotification}
            disabled={loading} // Disable the button while loading
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
          {success && <p color='success'>Notification sent successfully!</p>}
          {error && <p color='error'>{error}</p>}
        </div>
      </div>
    </div>
  );
};
