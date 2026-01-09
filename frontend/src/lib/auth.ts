// frontend/src/lib/auth.ts

/**
 * Obtiene el token JWT del localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    // Decodificar el JWT para verificar si expiró
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    // Si el token expiró, lo eliminamos
    if (payload.exp && payload.exp < now) {
      logout();
      return false;
    }
    
    return true;
  } catch {
    // Si hay error al decodificar, token inválido
    logout();
    return false;
  }
}

/**
 * Obtiene la info del usuario del localStorage
 */
export function getUser(): any | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Cierra sesión eliminando token y usuario
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Headers con autenticación para fetch
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}
