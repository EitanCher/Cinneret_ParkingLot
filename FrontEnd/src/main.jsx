import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import your global CSS file here if you have one
import { NextUIProvider } from '@nextui-org/react';

// Create a root element and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </React.StrictMode>
);
