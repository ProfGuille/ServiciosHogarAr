import { useQuery } from "@tanstack/react-query";
import { getToken, getUser, isAuthenticated as checkAuth } from "@/lib/auth";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => {
      // Verificar si hay token válido en localStorage
      if (!checkAuth()) {
        return null;
      }
      
      // Obtener usuario del localStorage
      const userData = getUser();
      return userData;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && checkAuth(),
    error: null,
  };
}
