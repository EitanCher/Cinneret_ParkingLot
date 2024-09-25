import React, { useState, useEffect } from 'react';

import 'react-lazy-load-image-component/src/effects/blur.css';

import { IncomeAndUserCount } from '../IncomeAndUserCount';
import { PlaceholderCard } from '../../PlaceHolder';
import { CitiesQuickView } from '../CitiesQuickView';
import { FaultsCard } from '../Faults';
import { RecentUsersCard } from '../RecentUsers';
import { AverageParkingCard } from '../AverageParking';
import { RecentParkingLogsCard } from '../RecentParkingLogs';
export const Overview = () => {
  // Define which index to replace with the data
  const userCountsCard = 0;
  const AverageParking = 1;
  const citiesQuickViewCard = 2;
  const faultsCard = 3;

  return (
    <div className='flex flex-1'>
      <div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full'>
        <div className='flex flex-col md:flex-row gap-2'>
          {[...new Array(4)].map((_, i) =>
            i === userCountsCard ? (
              <IncomeAndUserCount key={`card-${i}`} />
            ) : i === AverageParking ? (
              <AverageParkingCard key={`card-${i}`} title='Income data' />
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
            ) : i === 1 ? (
              <RecentParkingLogsCard key={`recent-parking-${i}`} className='w-full md:w-2/3 lg:w-3/4 xl:w-full bg-gray-100 dark:bg-neutral-800' />
            ) : (
              <div key={`placeholder-${i}`} className='h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse'></div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
