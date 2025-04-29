import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * A component that protects routes based on user authentication, permissions, and roles
 * @param children The content to render if the user is authenticated and has the required permissions/roles
 * @param requiredPermission Optional permission required to access the route
 * @param requiredRoles Optional array of roles allowed to access the route
 * @param redirectTo Optional path to redirect to if the user is not authenticated or doesn't have the required permissions/roles
 */
export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRoles = [], 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, hasPermission } = useAuth();
  const [, navigate] = useLocation();
  
  // If user is not authenticated, redirect to login
  if (!user) {
    navigate(redirectTo);
    return null;
  }
  
  // If a specific permission is required, check if the user has it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    navigate('/dashboard');
    return null;
  }
  
  // If specific roles are required, check if the user has one of them
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    navigate('/dashboard');
    return null;
  }
  
  return <>{children}</>;
}