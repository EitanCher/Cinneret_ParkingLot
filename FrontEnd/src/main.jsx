// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import your global CSS file here if you have one
import { ThemeProvider } from './Context/ThemeContext'; // Import ThemeProvider
import { NextUIProvider } from '@nextui-org/react'; // Import NextUIProvider
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router

// Create a root element and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <NextUIProvider>
    <ThemeProvider>
      <Router>
        {' '}
        {/* Wrap the App component with Router */}
        <App />
      </Router>
    </ThemeProvider>
  </NextUIProvider>
);
