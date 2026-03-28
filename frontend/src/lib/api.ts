const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions): Promise<{ data: T }> => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<{ data: T }> => request<T>(endpoint, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<{ data: T }> => request<T>(endpoint, { ...options, method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  delete: <T = any>(endpoint: string, options?: RequestOptions): Promise<{ data: T }> => request<T>(endpoint, { ...options, method: 'DELETE' }),
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let finalEndpoint = endpoint;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      finalEndpoint += `${endpoint.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  let response = await fetch(`${BASE_URL}${finalEndpoint}`, { ...options, headers });

  if (response.status === 401 && token) {
    const refreshed = await refreshToken();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
      response = await fetch(`${BASE_URL}${finalEndpoint}`, { ...options, headers });
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.assign('/login');
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'API Error');
  }

  const responseData = await response.json();
  return { data: responseData };
}

export async function refreshToken() {
  const refreshTk = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshTk) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTk }),
    });

    if (res.ok) {
      const { accessToken, refreshToken: newRefreshTk } = await res.json();
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshTk);
      return true;
    }
  } catch (err) {
    // Ignore error
  }
  return false;
}
