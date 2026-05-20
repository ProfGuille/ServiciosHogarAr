import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? 'http://localhost:3000'
    : 'https://servicioshogar-backend-uje1.onrender.com'
);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure URL is absolute
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join("/") as string;
    // Ensure URL is absolute
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const token = localStorage.getItem("token");
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") return null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'sessionId=; Max-Age=0; path=/;';
      window.location.href = '/login?expired=1';
      throw new Error('Sesión expirada');
    }

    await throwIfResNotOk(res);
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
