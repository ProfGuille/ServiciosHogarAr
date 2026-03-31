import { getToken, getUser, isAuthenticated as checkAuth } from "@/lib/auth";

export function useAuth() {
  const user = getUser();
  const authenticated = checkAuth();

  return {
    user,
    isLoading: false,
    isAuthenticated: authenticated && !!user,
    error: null,
  };
}
