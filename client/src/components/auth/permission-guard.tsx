import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions
 * @param permission The permission required to view the content
 * @param children The content to render if the user has the required permission
 * @param fallback Optional content to render if the user doesn't have the required permission
 */
export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuth();
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
}