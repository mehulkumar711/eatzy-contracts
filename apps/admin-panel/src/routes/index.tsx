import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import AppLayout from '@/layouts/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RouteErrorBoundary from '@/components/RouteErrorBoundary';

// Lazy-load pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const UsersManagementPage = lazy(() => import('@/pages/UsersManagementPage'));

export const router = createBrowserRouter([
  // Public Route
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  // Protected Routes (Wrapped in ProtectedRoute)
  {
    path: '/',
    element: (
      // This is the authentication check that runs on all dashboard routes
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'users',
        element: <UsersManagementPage />,
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },
  // Catch-all route for bad URLs
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
    errorElement: <RouteErrorBoundary />,
  },
]);