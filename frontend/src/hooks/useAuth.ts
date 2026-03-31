import { useQuery } from "@tanstack/react-query";
import { getToken, getUser, isAuthenticated as checkAuth } from "@/lib/auth";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => {
      if (!checkAuth()) return null;
      return getUser();
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
