const envApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

const isBrowser = typeof window !== 'undefined';
const isLocalHost =
  isBrowser &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// In production without VITE_API_BASE_URL, fall back to same-origin /api calls.
export const API_BASE_URL = envApiBaseUrl || (isLocalHost ? 'http://localhost:5000' : '');

if (!envApiBaseUrl && !isLocalHost) {
  console.warn('VITE_API_BASE_URL is not set. Falling back to same-origin /api calls.');
}

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
