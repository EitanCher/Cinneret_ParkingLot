import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import your global CSS file here if you have one
import { ThemeProvider } from './Context/ThemeContext'; // Import ThemeProvider
import { NextUIProvider } from '@nextui-org/react'; // Import NextUIProvider

// Create a root element and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <NextUIProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </NextUIProvider>
);
