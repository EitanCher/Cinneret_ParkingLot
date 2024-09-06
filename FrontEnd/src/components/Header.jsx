import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from '@nextui-org/react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation from react-router-dom

const Header = () => {
  const location = useLocation(); // Get the current location

  // Function to determine if the current path matches the given path
  const isActivePath = (path) => location.pathname === path;

  return (
    <Navbar isBordered isBlurred={true}>
      <NavbarBrand>
        <div className='flex items-center gap-4'>
          <svg viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 text-[#111118]'>
            <path d='M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z' fill='currentColor'></path>
          </svg>
          <p className='text-[#111118] text-lg font-bold leading-tight tracking-[-0.015em]'>ParkNow</p>
        </div>{' '}
      </NavbarBrand>
      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        <NavbarItem isActive={isActivePath('/')}>
          <Link to='/' color='foreground'>
            Home
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActivePath('/cities')}>
          <Link to='/cities' color='foreground'>
            Cities
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActivePath('/subscriptions')}>
          <Link to='/subscriptions' color='foreground'>
            Subscriptions
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify='end'>
        <NavbarItem>
          <Button as={Link} color='primary' to='/login' variant='shadow'>
            Log In{' '}
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color='default' to='/signup' variant='shadow'>
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default Header;
