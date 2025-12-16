// Django API Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Token management
export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const setTokens = (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

// API client with automatic token refresh
export const apiClient = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const token = getAccessToken();

    const headers: HeadersInit = {
        ...options.headers,
    };

    // Add auth header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add Content-Type for JSON requests (not for FormData)
    if (options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && endpoint !== '/auth/refresh/') {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (refreshResponse.ok) {
                const { access } = await refreshResponse.json();
                localStorage.setItem('access_token', access);

                // Retry original request with new token
                headers['Authorization'] = `Bearer ${access}`;
                return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
            } else {
                // Refresh failed, logout
                clearTokens();
                window.location.href = '/auth';
            }
        }
    }

    return response;
};

export default apiClient;
