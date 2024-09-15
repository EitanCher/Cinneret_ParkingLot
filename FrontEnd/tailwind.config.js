const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode with class strategy

  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust according to your file structure
    './public/index.html', // Include if you have HTML files in public
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}' // NextUI specific
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#111118',
        'dark-text': '#f7fafc',

        'navbar-bg': '#111118',
        'navbar-menu-bg': 'rgba(0, 0, 0, 0.8)',
        text: '#111118',
        'card-bg': '#1f1f1f',
        'card-border': '#333333',
        'card-text': '#e2e8f0'
      },
      boxShadow: {
        card: '0 4px 8px rgba(0, 0, 0, 0.3)'
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      fontWeight: {
        hairline: 100,
        thin: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900
      },
      screens: {
        xs: '375px',
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
      }
    }
  },
  plugins: [
    nextui() // NextUI Tailwind plugin
    // You can add more plugins here if needed
  ]
};
