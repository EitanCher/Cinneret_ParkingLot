import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '../../ui/sidebar';
import { IconArrowLeft, IconBrandTabler, IconSettings, IconUserBolt, IconParking } from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { fetchUserDetails } from '../../../api/userApi';
import { fetchUserCounts } from '../../../api/adminApi';
import { ViewOnly, PlaceholderCard, IncomeDataCard } from '../DashboardCards';
import { CitiesQuickView } from '../admin/CitiesQuickView';
import { FaultsCard } from './Faults';
import { RecentUsersCard } from './RecentUsers';
function SidebarDemo() {
  const [userData, setUserData] = useState(null);
  const [incomeData, setIncomeData] = useState([]);
  const [userCounts, setUserCounts] = useState({
    inactiveUserCount: 0,
    activeUserCount: 0,
    totalUserCount: 0
  });
  const [errors, setErrors] = useState({
    userCounts: null,
    incomeData: null,
    component3: null,
    component4: null,
    component5: null
  });

  useEffect(() => {
    const handleUserCounts = async () => {
      try {
        const counts = await fetchUserCounts();
        const { inactiveUserCount, activeUserCount, totalUserCount } = counts;
        setUserCounts({ inactiveUserCount, activeUserCount, totalUserCount });
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          userCounts: 'An error occurred while fetching user counts.'
        }));
      }
    };
    const handleUserData = async () => {
      try {
        const userInfo = await fetchUserDetails();
        setUserData(userInfo);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          component1: 'An error occurred while fetching user details.'
        }));
      }
    };

    handleUserData();
    handleUserCounts(); // Call handleUserCounts to fetch user counts
  }, []);

  const links = [
    {
      label: 'Overview',
      href: '#',
      icon: <IconBrandTabler className='text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0' />
    },
    {
      label: 'Users',
      href: '#',
      icon: <IconUserBolt className='text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0' />
    },
    {
      label: 'Parking Lots',
      href: '#',
      icon: <IconParking className='text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0' />
    },
    {
      label: 'Settings',
      href: '#',
      icon: <IconSettings className='text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0' />
    },
    {
      label: 'Logout',
      href: '#',
      icon: <IconArrowLeft className='text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0' />
    }
  ];

  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-full mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden',
        'h-[60vh]'
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className=' justify-between gap-10'>
          <div className='flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
            {open ? <Logo /> : <LogoIcon />}
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
      <Dashboard userCounts={userCounts} errors={errors.userCounts} />
    </div>
  );
}

export default SidebarDemo;

export const Logo = () => (
  <Link href='#' className='font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20'>
    <div className='h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0' />
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='font-medium text-black dark:text-white whitespace-pre'>
      Acet Labs
    </motion.span>
  </Link>
);

export const LogoIcon = () => (
  <Link href='#' className='font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20'>
    <div className='h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0' />
  </Link>
);

const Dashboard = ({ userCounts, errors }) => {
  // Provide default values to avoid destructuring errors
  const { inactiveUserCount = 0, activeUserCount = 0, totalUserCount = 0 } = userCounts || {};

  // Define which index to replace with the data
  const userCountsCard = 0;
  const incomeDataCard = 1;
  const citiesQuickViewCard = 2;
  const faultsCard = 3;

  return (
    <div className='flex flex-1'>
      <div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full'>
        <div className='flex flex-col md:flex-row gap-2'>
          {[...new Array(4)].map((_, i) =>
            i === userCountsCard ? (
              <ViewOnly
                key={`card-${i}`}
                title='User Count'
                content={errors ? `Error: ${errors}` : `Active: ${activeUserCount} | Inactive: ${inactiveUserCount} | Total: ${totalUserCount}`}
              />
            ) : i === incomeDataCard ? (
              <IncomeDataCard key={`card-${i}`} title='Income data' />
            ) : i === citiesQuickViewCard ? (
              <CitiesQuickView key={`card-${i}`} />
            ) : i === faultsCard ? (
              <FaultsCard key={`card-${i}`} className='bg-gray-100 dark:bg-neutral-800' />
            ) : (
              <PlaceholderCard key={`placeholder-${i}`} />
            )
          )}
        </div>
        <div className='flex flex-col md:flex-row gap-2 flex-1'>
          {[...new Array(2)].map((_, i) =>
            i === 0 ? (
              <RecentUsersCard key={`recent-users-${i}`} className='w-full md:w-2/3 lg:w-3/4 xl:w-full bg-gray-100 dark:bg-neutral-800' />
            ) : (
              <div key={`placeholder-${i + 4}`} className='h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse'></div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
