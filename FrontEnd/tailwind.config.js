const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media', // Enable dark mode with class strategy

  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust according to your file structure
    './public/index.html', // Include if you have HTML files in public
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}' // NextUI specific
  ],
  theme: {
    extend: {
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
