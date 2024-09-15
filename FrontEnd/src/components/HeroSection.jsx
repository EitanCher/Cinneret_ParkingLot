import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image } from '@nextui-org/react';
import { useAuth } from '../Context/authContext';
import backgroundImage8 from '../assets/images/HeroSection.jpg'; // Adjust the path as needed
import { IconBrandTabler } from '@tabler/icons-react';

const HeroSection = () => {
  const { isAuthenticated, loading } = useAuth(); // Get authentication status and loading state from context

  return (
    <div className='relative'>
      <div className='p-4 md:p-4'>
        <div
          className='  flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 md:px-10 pb-10'
          style={{
            backgroundImage: ` linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url(${backgroundImage8})`
          }}
        >
          <div className='flex flex-col gap-2 text-left font-sans'>
            <h1 className='text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:leading-tight md:tracking-[-0.033em]'>
              Welcome to ParkNow
            </h1>
            <h2 className='text-white text-sm font-normal leading-normal md:text-base'>
              The smarter way to park. Pay for parking on the go and receive reminders before time runs out. Extend your session without leaving your
              spot.
            </h2>
          </div>
          <div className='flex flex-wrap gap-3  '>
            {!isAuthenticated && (
              <>
                <Button as={Link} color='primary' to='/login' variant='shadow'>
                  Log In{' '}
                </Button>
                <Button as={Link} color='default' to='/subscriptions' variant='shadow'>
                  Sign Up
                </Button>
              </>
            )}

            {isAuthenticated && (
              <>
                <Button as={Link} color='primary' to='/sidebar-demo' variant='shadow'>
                  <IconBrandTabler />
                  Park Now
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Button } from '@nextui-org/react';

// import backgroundImage8 from '../assets/images/HeroSection.jpg'; // Adjust the path as needed

// const HeroSection = () => {
//   return (
//     <div className='relative'>
//       <div className='p-4 md:p-4'>
//         {/* Container for background image with zoom effect */}
//         <div className='relative min-h-[480px] flex flex-col gap-6 items-start justify-end px-4 md:px-10 pb-10 rounded-xl overflow-hidden'>
//           {/* Background image */}
//           <div className='absolute inset-0'>
//             <img
//               src={backgroundImage8}
//               alt='Hero Background'
//               className='w-full h-full object-cover transition-transform duration-500 ease-in-out transform hover:scale-125'
//               style={{ zIndex: -1 }}
//             />
//           </div>
//           {/* Content on top of the image */}
//           <div className=' z-10'>
//             <div className='flex flex-col gap-2 text-left font-sans text-white'>
//               <h1 className='text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl md:leading-tight md:tracking-[-0.033em]'>
//                 Welcome to ParkNow
//               </h1>
//               <h2 className='text-sm font-normal leading-normal md:text-base'>
//                 The smarter way to park. Pay for parking on the go and receive reminders before time runs out. Extend your session without leaving
//                 your spot.
//               </h2>
//             </div>
//             <div className='flex flex-wrap gap-3 mt-4'>
//               <Button as={Link} color='primary' to='/login' variant='shadow'>
//                 Log In
//               </Button>
//               <Button as={Link} color='default' to='/subscriptions' variant='shadow'>
//                 Sign Up
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HeroSection;
