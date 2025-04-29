import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Use the Spring Boot API URL (default to localhost:8080 with no /api suffix)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure URL has the correct prefix
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

  console.log(`API Request: ${method} ${fullUrl}`, data);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        // Add Authorization header if JWT token exists in localStorage
        ...getAuthHeader(),
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`API Response status: ${res.status} ${res.statusText}`);

    // Clone the response before reading it
    const resClone = res.clone();

    if (!res.ok) {
      const errorText = await resClone.text();
      console.error(`API Error: ${res.status} ${res.statusText}`, errorText);
      throw new Error(errorText);
    }

    return res;
  } catch (error) {
    console.error(`API Request failed: ${method} ${fullUrl}`, error);
    throw error;
  }
}

// Helper function to get auth header with JWT token if available
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    // Ensure URL has the correct prefix
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: {
        ...getAuthHeader(),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text() || res.statusText;
      throw new Error(`${res.status}: ${errorText}`);
    }

    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
