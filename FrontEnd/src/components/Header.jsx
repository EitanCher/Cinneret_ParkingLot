import React from 'react';
import { Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenuItem, NavbarMenu, NavbarContent, NavbarItem, Button } from '@nextui-org/react';
import { useAuth } from '../Context/authContext';
import { Link, useLocation } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher'; // Import the ThemeSwitcher component
import { useTheme } from '../Context/ThemeContext'; // Import useTheme from your ThemeContext

const Header = () => {
  const { isDarkMode, setIsDarkMode } = useTheme(); // Access theme state and updater function
  const { isAuthenticated, loading, logoutUser } = useAuth(); // Get authentication status and loading state from context
  const location = useLocation();

  const isActivePath = (path) => location.pathname === path;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Cities', path: '/cities' },
    { name: 'Subscriptions', path: '/subscriptions' }
  ];

  return (
    <Navbar isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} isBordered isBlurred={true} className={isDarkMode ? 'bg-dark-bg' : ''}>
      <NavbarContent>
        <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} className='sm:hidden' />
        <NavbarBrand>
          <div className='flex items-center gap-4'>
            <svg viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-4 h-4  text'>
              <path d='M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z' fill='currentColor'></path>
            </svg>
            <p className='text text-lg font-bold leading-tight tracking-[-0.015em]'>ParkNow</p>
          </div>
        </NavbarBrand>
      </NavbarContent>
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
      <NavbarContent
        className={`transition-opacity duration-500 ease-in-out ${loading ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
        justify='end'
      >
        <NavbarItem>
          <ThemeSwitcher setIsDarkMode={setIsDarkMode} isDarkMode={isDarkMode} />
        </NavbarItem>
        {!loading && !isAuthenticated && (
          <>
            <NavbarItem>
              <Button as={Link} color='primary' to='/login' variant='shadow'>
                Log In
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color='default' to='/signup' variant='shadow'>
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}

        {!loading && isAuthenticated && (
          <NavbarItem>
            <Button color='danger' onClick={logoutUser} variant='solid'>
              Log Out
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
      <NavbarMenu className={`navbar-menu ${isDarkMode ? 'dark' : ''}`}>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              onClick={() => setIsMenuOpen(false)}
              color={index === 2 ? 'primary' : 'foreground'}
              className='w-full dark:text-white'
              to={item.path}
              size='lg'
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

export default Header;
