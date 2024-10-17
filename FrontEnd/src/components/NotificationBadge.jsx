import { Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { IconBellRinging as NotificationIcon } from '@tabler/icons-react';

export default function NotificationBadge({ notificationsCount }) {
  const items = [
    {
      key: 'view_all',
      label: 'View all notifications'
    },
    {
      key: 'mark_read',
      label: 'Mark all as read'
    }
  ];

  return (
    <Dropdown>
      <DropdownTrigger>
        <Badge content={notificationsCount || '0'} shape='circle' color='danger'>
          <div>
            <NotificationIcon size={24} />
          </div>
        </Badge>
      </DropdownTrigger>

      <DropdownMenu aria-label='Notification Actions' items={items}>
        {(item) => <DropdownItem key={item.key}>{item.label}</DropdownItem>}
      </DropdownMenu>
    </Dropdown>
  );
}
