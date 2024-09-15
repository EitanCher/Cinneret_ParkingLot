// src/components/ThemeSwitcher.jsx
import React from 'react';
import { useTheme } from '../Context/ThemeContext';
import { IoIosMoon, IoIosSunny } from 'react-icons/io';

const ThemeSwitcher = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div>
      <button onClick={toggleTheme} className='p-2'>
        {isDarkMode ? <IoIosSunny className='w-6 h-6 text-gray-500' /> : <IoIosMoon className='w-6 h-6 text-gray-400' />}
      </button>
    </div>
  );
};

export default ThemeSwitcher;
