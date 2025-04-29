import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";
import { dbService } from "../lib/db/dbService";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  hasPermission: (permission: string) => boolean;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = localStorage.getItem("jwt_token");
      if (!token) return null;
      return await dbService.getCurrentUser(token);
    },
    // Only attempt to fetch user data if we have a token
    enabled: !!localStorage.getItem("jwt_token"),
  });

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token && !user) {
      refetch();
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const data = await dbService.login(credentials.username, credentials.password);
      
      if (!data) {
        throw new Error("Échec de la connexion");
      }
      
      // Store JWT token in localStorage if it exists in the response
      if (data.token) {
        localStorage.setItem("jwt_token", data.token);
      }

      return data.user; // Return user data from response
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["currentUser"], user);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.fullName}`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de la connexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const data = await dbService.register(credentials);
      
      // Store JWT token in localStorage if it exists in the response
      if (data.token) {
        localStorage.setItem("jwt_token", data.token);
      }

      return data.user; // Return user data from response
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["currentUser"], user);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de l'inscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Remove the token from localStorage
      localStorage.removeItem("jwt_token");
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    },
    onError: (error: Error) => {
      // Even if there's an error, we've removed the token locally
      queryClient.setQueryData(["currentUser"], null);
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    },
  });

  // Function to check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return dbService.hasPermission(user, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
