// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000, // Adjust the port if needed
//     open: true // Open the browser on server start
//   }
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const process = require('process');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      process: 'process/browser' // Polyfill process
    }
  },
  server: {
    port: 3000,
    open: true
  },
  define: {
    'process.env': {} // Optionally define process.env
  }
});
