/**
 * Obtiene el token JWT del localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Verifica si el usuario está autenticado
 * Usa 'user' en localStorage porque backend maneja auth con cookies HTTP-only
 */
export function isAuthenticated(): boolean {
  const userStr = localStorage.getItem('user');
  return !!userStr;
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
  // También limpiar la cookie del backend
  document.cookie = 'sessionId=; Max-Age=0; path=/;';
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
