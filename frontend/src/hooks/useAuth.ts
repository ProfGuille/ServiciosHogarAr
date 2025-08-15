import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Return null on error (backend not available)
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        
        if (response.status === 401) {
          // User not authenticated - this is expected
          return null;
        }
        
        if (!response.ok) {
          // Backend error - treat as not authenticated but don't hang
          console.warn('Authentication check failed:', response.status);
          return null;
        }
        
        return await response.json();
      } catch (error) {
        // Network error or backend not available - don't hang the app
        console.warn('Authentication check failed:', error);
        return null;
      }
    },
    // Don't hang indefinitely
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error: error as Error | null,
  };
}
