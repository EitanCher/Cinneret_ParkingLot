import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter } from '@nextui-org/card';

export const PlaceholderCard = () => {
  return (
    <Card className='w-full max-w-md bg-gray-100 dark:bg-neutral-800 animate-pulse'>
      <CardBody className='h-20'>
        <div className='h-full w-full flex flex-col justify-between'></div>
      </CardBody>
    </Card>
  );
};
