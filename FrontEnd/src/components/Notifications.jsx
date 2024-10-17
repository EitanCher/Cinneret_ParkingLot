import React, { useState } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';

const Notifications = () => {
  const [notifications] = useState([
    {
      id: 1,
      title: 'Welcome to ParkNow!',
      content: 'Thank you for signing up. Enjoy seamless parking!'
    },
    {
      id: 2,
      title: 'Parking Spot Availability',
      content: 'New parking spots are available in your subscribed city!'
    },
    {
      id: 3,
      title: 'Subscription Reminder',
      content: 'Your subscription is about to expire. Please renew soon!'
    }
  ]);

  return (
    <div className='px-4 py-10'>
      <h2 className='text-2xl font-bold mb-6 text-center'>Your Notifications</h2>
      <div className='max-w-3xl mx-auto'>
        <Accordion>
          {notifications.map((notification) => (
            <AccordionItem key={notification.id} title={notification.title} subtitle='Tap to read more'>
              <p>{notification.content}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Notifications;
