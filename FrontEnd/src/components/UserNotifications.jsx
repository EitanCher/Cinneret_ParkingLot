import React, { useState, useEffect } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { fetchAllUserNotifications, markSingleNotificationRead } from '@/api/userApi';
import { IconBellPlus } from '@tabler/icons-react';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user notifications
  const handleFetchNotifications = async () => {
    try {
      const data = await fetchAllUserNotifications();
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications.');
      setLoading(false);
    }
  };

  // Mark a single notification as read only if it's unread
  const handleMarkRead = async (notificationId, isRead) => {
    if (isRead) return; // Don't do anything if the notification is already read

    try {
      await markSingleNotificationRead(notificationId);
      // Update the local state to mark this notification as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                userNotifications: notification.userNotifications.map((userNotification) => ({
                  ...userNotification,
                  isRead: true
                }))
              }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    handleFetchNotifications();
  }, []);

  // Display loading state
  if (loading) {
    return <p>Loading notifications...</p>;
  }

  // Display error message if there's an error
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className='px-4 py-10'>
      <h2 className='text-2xl font-semibold mb-6 text-center'>Your Notifications</h2>
      <div className='max-w-3xl mx-auto'>
        <Accordion>
          {notifications.map((notification) => {
            const isRead = notification.userNotifications?.[0]?.isRead; // Access the first userNotification's isRead status
            return (
              <AccordionItem
                key={notification.id}
                title={notification.title || 'Untitled Notification'}
                subtitle='Tap to read more'
                indicator={!isRead ? <IconBellPlus /> : null} // Show bell icon if unread
                onClick={() => handleMarkRead(notification.id, isRead)} // Mark as read only if unread
              >
                <p>{notification.message}</p>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default UserNotifications;
