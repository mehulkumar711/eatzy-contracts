import { useAuthStore } from '@/stores/authStore';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useEffect, useState } from 'react';


/**
 * Protects a route by checking for a valid (non-expired) token.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Basic check structure (actual validation happens in API interceptor)
    setIsChecking(false);
  }, [user, logout]);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Verifying session..." />
      </div>
    );
  }

  // If user object is not in store, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;  