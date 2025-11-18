// apps/admin-panel/src/main.tsx (FINAL WIRING)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom'; // New Router API
import { router } from './routes'; // Import the defined Data Router
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Use RouterProvider to inject the routing context into the app */}
    <RouterProvider router={router} />
  </React.StrictMode>,
);