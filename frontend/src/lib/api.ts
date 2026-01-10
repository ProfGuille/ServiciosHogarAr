const API_URL = import.meta.env.VITE_API_URL || 'https://api.servicioshogar.com.ar';

export function getApiUrl(path?: string) {
  if (path) {
    return `${API_URL}${path}`;
  }
  return API_URL;
}
