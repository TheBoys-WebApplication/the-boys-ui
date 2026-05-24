import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../store/auth';

export default function ProtectedRoute() {
  const { isAuthenticated, isInitialising } = useAuthContext();

  // Wait for the session-restore check before making any redirect decision.
  if (isInitialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-navy-900">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-600 border-t-transparent dark:border-brand-400" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
