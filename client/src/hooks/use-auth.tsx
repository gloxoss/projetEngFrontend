import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // Only attempt to fetch user data if we have a token
    enabled: !!localStorage.getItem("jwt_token"),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await res.json();

      // Store JWT token in localStorage if it exists in the response
      if (data.token) {
        localStorage.setItem("jwt_token", data.token);
      }

      return data.user || data; // Return user data from response
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/auth/user"], user);
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
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      const data = await res.json();

      // Store JWT token in localStorage if it exists in the response
      if (data.token) {
        localStorage.setItem("jwt_token", data.token);
      }

      return data.user || data; // Return user data from response
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/auth/user"], user);
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
      // For Spring Boot, we might not need to call the server for logout
      // Just remove the token from localStorage
      localStorage.removeItem("jwt_token");

      // But if your Spring Boot backend has a logout endpoint, call it
      try {
        await apiRequest("POST", "/api/auth/logout");
      } catch (error) {
        // Ignore errors during logout
        console.log("Logout API call failed, but token was removed locally");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    },
    onError: (error: Error) => {
      // Even if the API call fails, we've removed the token locally
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
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
