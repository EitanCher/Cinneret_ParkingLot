import React, { useState, useEffect } from 'react';
import { useLocation, Link, Routes, Route, Outlet } from 'react-router-dom';
import { Sidebar, SidebarBody, SidebarLink } from '../../ui/sidebar';
import { IconUserBolt, IconBrandTabler } from '@tabler/icons-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { fetchUserDetails } from '../../../api/userApi';
import { BookSlot } from '../user/screens/BookSlot';

function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [open, setOpen] = useState(false);
  const [userDataError, setUserDataError] = useState();

  useEffect(() => {
    const handleUserData = async () => {
      try {
        const userInfo = await fetchUserDetails();
        setUserData(userInfo);
      } catch (error) {
        setUserDataError('An error occurred while fetching user details.');
      }
    };

    handleUserData();
  }, []);

  const links = [
    {
      label: 'Book',
      href: '/UserDashboard',
      icon: <IconBrandTabler className='text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0' />
    }
  ];

  return (
    <div
      className={cn(
        'rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1  mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden',
        'h-[60vh]'
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className='justify-between gap-10'>
          <div className='flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
            {open ? <Logo /> : <LogoIcon />} {/* Ensure LogoIcon is defined */}
            <div className='mt-8 flex flex-col gap-2'>
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            {userData ? (
              <SidebarLink
                link={{
                  label: `${userData.FirstName || 'User'} ${userData.LastName || ''}`,
                  href: '#',
                  icon: (
                    <LazyLoadImage
                      src='https://i.pravatar.cc/150?u=a042581f4e29026704d'
                      className='h-7 w-7 flex-shrink-0 rounded-full'
                      width={50}
                      height={50}
                      alt='Avatar'
                    />
                  )
                }}
              />
            ) : (
              <SidebarLink
                link={{
                  label: 'Loading...',
                  href: '#',
                  icon: <IconUserBolt className='text-neutral-700 dark:text-neutral-200 h-7 w-7 flex-shrink-0' />
                }}
              />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      <div className='flex-1 overflow-auto p-4'>
        <Routes>
          <Route path='/*' element={<BookSlot userData={userData} />} />
        </Routes>
        <Outlet />
      </div>
    </div>
  );
}

export default UserDashboard;
export const Logo = () => (
  <Link to='/UserDashboard' className='font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20'>
    <svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-black dark:text-white'>
      <path d='M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z' fill='currentColor'></path>
    </svg>
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='font-medium text-black dark:text-white whitespace-pre'>
      ParkNow
    </motion.span>
  </Link>
);

export const LogoIcon = () => (
  <Link to='/UserDashboard' className='font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20'>
    <svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-black dark:text-white'>
      <path d='M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z' fill='currentColor'></path>
    </svg>
  </Link>
);
