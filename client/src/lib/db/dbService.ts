// This is a frontend-only database service for testing purposes
// In a production environment, you should NEVER connect directly to a database from the frontend
// This is only for testing and development purposes

import { User, InsertUser } from '@shared/schema';

// Mock database for users
const users: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'hashed_password', // represents 'password'
    fullName: 'Admin User',
    role: 'resource_manager',
    departmentId: 1,
  },
  {
    id: 100,
    username: 'teacher',
    password: 'hashed_password', // represents 'password'
    fullName: 'Teacher User',
    role: 'teacher',
    departmentId: 1,
  },
  {
    id: 3,
    username: 'dept_head',
    password: 'hashed_password', // represents 'password'
    fullName: 'Department Head',
    role: 'department_head',
    departmentId: 1,
  },
  {
    id: 4,
    username: 'technician',
    password: 'hashed_password', // represents 'password'
    fullName: 'Technician User',
    role: 'technician',
    departmentId: 1,
  },
  {
    id: 5,
    username: 'supplier',
    password: 'hashed_password', // represents 'password'
    fullName: 'Supplier User',
    role: 'supplier',
    departmentId: 1,
  },
];

// Role permissions
export const rolePermissions = {
  teacher: ['view_resources', 'request_resources', 'report_maintenance'],
  department_head: ['view_resources', 'request_resources', 'report_maintenance', 'validate_needs', 'view_department_needs'],
  resource_manager: ['view_resources', 'manage_resources', 'assign_resources', 'create_call_for_offers', 'manage_suppliers'],
  technician: ['view_resources', 'view_maintenance', 'update_maintenance', 'create_constat'],
  supplier: ['view_call_for_offers', 'submit_offers'],
};

// Generate JWT token (mock implementation)
const generateToken = (user: User): string => {
  // In a real implementation, you would use a JWT library
  // This is just a mock implementation for testing
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };
  
  return btoa(JSON.stringify(payload));
};

// Verify password - simple implementation for browser environment
const verifyPassword = (plainPassword: string, hashedPassword: string): boolean => {
  // For testing purposes, we'll use a simple comparison
  // In a real app, you would use a secure hashing algorithm
  if (hashedPassword === 'hashed_password') {
    return plainPassword === 'password';
  }
  
  // For custom passwords during testing
  return hashedPassword === `hashed_${plainPassword}`;
};

// Hash password - simple implementation for browser environment
const hashPassword = (password: string): string => {
  // For testing purposes, return a simple string
  // In a real app, you would use a secure hashing algorithm
  return `hashed_${password}`;
};

export const dbService = {
  // User authentication
  login: async (username: string, password: string): Promise<{ user: User; token: string } | null> => {
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const isPasswordValid = verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Mot de passe incorrect');
    }
    
    // Create a copy of the user without the password
    const { password: _, ...userWithoutPassword } = user;
    const safeUser = { ...userWithoutPassword, password: '' };
    
    return {
      user: safeUser as User,
      token: generateToken(user),
    };
  },
  
  register: async (userData: InsertUser): Promise<{ user: User; token: string }> => {
    // Check if username already exists
    if (users.some(u => u.username === userData.username)) {
      throw new Error('Ce nom d\'utilisateur existe déjà');
    }
    
    // Hash password
    const hashedPassword = hashPassword(userData.password);
    
    // Create new user
    const newUser: User = {
      id: users.length + 1,
      username: userData.username,
      password: hashedPassword,
      fullName: userData.fullName,
      role: userData.role,
      departmentId: userData.departmentId,
    };
    
    // Add to users array
    users.push(newUser);
    
    // Create a copy of the user without the password
    const { password: _, ...userWithoutPassword } = newUser;
    const safeUser = { ...userWithoutPassword, password: '' };
    
    return {
      user: safeUser as User,
      token: generateToken(newUser),
    };
  },
  
  getCurrentUser: async (token: string): Promise<User | null> => {
    if (!token) return null;
    
    try {
      // Decode token
      const payload = JSON.parse(atob(token));
      
      // Find user
      const user = users.find(u => u.id === payload.id);
      
      if (!user) return null;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return { ...userWithoutPassword, password: '' } as User;
    } catch (error) {
      return null;
    }
  },
  
  // Check if user has permission
  hasPermission: (user: User, permission: string): boolean => {
    if (!user || !user.role) return false;
    
    const permissions = rolePermissions[user.role as keyof typeof rolePermissions] || [];
    return permissions.includes(permission);
  },
};