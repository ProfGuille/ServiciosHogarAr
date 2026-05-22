import { useQuery } from "@tanstack/react-query";
import { getToken, getUser, isAuthenticated as checkAuth } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      if (!checkAuth()) return null;
      const cached = getUser();
      if (!cached) return null;
      if (!cached.createdAt) {
        try {
          const token = getToken();
          const res = await fetch(getApiUrl('/api/auth/me'), {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const fresh = await res.json();
            localStorage.setItem('user', JSON.stringify({ ...cached, ...fresh }));
            return { ...cached, ...fresh };
          }
        } catch {}
      }
      return cached;
    },
    initialData: () => checkAuth() ? getUser() : null,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && checkAuth(),
    error: null,
  };
}
