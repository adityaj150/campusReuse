// src/components/RequireAuth.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../services/auth';

interface RequireAuthProps {
  children: JSX.Element;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const token = getToken();
  if (!token) {
    // Preserve the intended destination so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
