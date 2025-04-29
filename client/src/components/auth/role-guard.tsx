import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface RoleGuardProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on user roles
 * @param roles Array of roles allowed to view the content
 * @param children The content to render if the user has one of the required roles
 * @param fallback Optional content to render if the user doesn't have any of the required roles
 */
export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { user } = useAuth();
  
  if (user && roles.includes(user.role)) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
}