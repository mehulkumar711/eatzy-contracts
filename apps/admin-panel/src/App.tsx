// apps/admin-panel/src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppLayout from './layouts/AppLayout';
import { useAuthStore } from './stores/authStore';

// HOC for authentication enforcement
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if token exists in state
  const token = useAuthStore((s) => s.accessToken);
  
  // Redirect unauthenticated users to login
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    // Note: BrowserRouter is now in main.tsx (standard practice)
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* All protected routes are nested under the ProtectedRoute guard and AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={
            <div className="tw-space-y-4">
                <h1 className="tw-text-2xl tw-font-bold">Admin Dashboard</h1>
                <p>System Overview: Operational. Use the sidebar for management tasks.</p>
            </div>
          } 
        />
        {/* Default route redirects to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
      
      {/* Catch-all route for any undefined path */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}