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
 * Maneja sesión expirada: limpia storage y redirige al login
 */
export function handleSessionExpired(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'sessionId=; Max-Age=0; path=/;';
  window.location.href = '/login?expired=1';
}

/**
 * Fetch con manejo automático de 401
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    handleSessionExpired();
    throw new Error('Sesión expirada');
  }
  return res;
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
