import { supabase } from './supabase';

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// True while the first request after a cold start is being retried. Lets the UI
// show a "waking up the server" hint instead of looking frozen.
let _warming = false;
const _warmListeners = new Set();
export function onWarmingChange(cb) {
  _warmListeners.add(cb);
  return () => _warmListeners.delete(cb);
}
function setWarming(v) {
  if (_warming === v) return;
  _warming = v;
  _warmListeners.forEach((cb) => cb(v));
}
export const isWarming = () => _warming;

/**
 * Fetch wrapper that attaches the Supabase auth token and survives Render
 * cold starts. On network errors or 502/503/504 (service waking up) it retries
 * with backoff instead of failing the first request after spin-down.
 */
export async function authFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = buildApiUrl(path);
  const maxAttempts = options.noRetry ? 1 : 6;
  const backoff = [1000, 2000, 4000, 6000, 8000];
  let lastErr;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { ...options, headers });
      // 502/503/504 => Render is spinning the instance up. Retry.
      if ([502, 503, 504].includes(res.status) && attempt < maxAttempts - 1) {
        if (attempt >= 1) setWarming(true);
        await sleep(backoff[Math.min(attempt, backoff.length - 1)]);
        continue;
      }
      setWarming(false);
      return res;
    } catch (err) {
      // Network error (server unreachable while cold-booting).
      lastErr = err;
      if (attempt < maxAttempts - 1) {
        if (attempt >= 1) setWarming(true);
        await sleep(backoff[Math.min(attempt, backoff.length - 1)]);
        continue;
      }
      setWarming(false);
      throw lastErr;
    }
  }
  throw lastErr;
}

/**
 * Fire-and-forget warmup ping. Call once on app load so the backend is booting
 * while the user reads the landing page. Unauthenticated, cheap.
 */
export async function warmupBackend() {
  try {
    await fetch(buildApiUrl('/api/keepalive'), { method: 'GET', cache: 'no-store' });
  } catch {
    /* ignore — this is best-effort */
  }
}
