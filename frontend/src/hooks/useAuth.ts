import { useQuery } from "@tanstack/react-query";
import { getToken, getUser, isAuthenticated as checkAuth } from "@/lib/auth";
import { getApiUrl } from "@/lib/api";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => {
      if (!checkAuth()) return null;
      const cached = getUser();
      if (!cached) return null;
      // Refrescar createdAt en background si falta, sin bloquear
      if (!cached.createdAt) {
        const token = getToken();
        fetch(getApiUrl('/api/auth/me'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).then(res => {
          if (res.ok) return res.json();
        }).then(fresh => {
          if (fresh) localStorage.setItem('user', JSON.stringify({ ...cached, ...fresh }));
        }).catch(() => {});
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
