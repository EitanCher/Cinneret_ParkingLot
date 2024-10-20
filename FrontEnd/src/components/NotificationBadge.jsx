import { Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { IconBellRinging as NotificationIcon } from '@tabler/icons-react';
import { markNotificationsAsRead } from '@/api/userApi';
import { useNavigate } from 'react-router-dom';

export default function NotificationBadge({ notificationsCount, setNotificationsCount }) {
  const navigate = useNavigate();

  const handleMarkAsRead = async () => {
    try {
      const response = await markNotificationsAsRead();
      if (response.status === 200) {
        setNotificationsCount(0);
      } else {
        console.error('Failed to mark notifications as read.');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleViewMessages = () => {
    navigate('/notifications');
  };

  const items = [
    {
      key: 'view_all',
      label: 'View all notifications',
      action: handleViewMessages
    },
    {
      key: 'mark_read',
      label: 'Mark all as read',
      action: handleMarkAsRead
    }
  ];

  return (
    <Dropdown>
      <DropdownTrigger>
        <div style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
          <Badge content={notificationsCount || '0'} shape='circle' color='danger'>
            <NotificationIcon size={24} />
          </Badge>
        </div>
      </DropdownTrigger>

      <DropdownMenu aria-label='Notification Actions' items={items}>
        {(item) => (
          <DropdownItem key={item.key} onClick={item.action}>
            {item.label}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
