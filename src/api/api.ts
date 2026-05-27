import axios from 'axios';

// const base_url = 'http://localhost:8080/api';
const base_url = 'https://engineerbackendapp-sxote.ondigitalocean.app/api';

const api = axios.create({
  baseURL: base_url,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookies
});

// Response interceptor for handling 401 errors and refreshing tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Special case: if we are on login page, don't try to refresh
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        await axios.post(`${base_url}/admin/auth/refresh-token`, {}, { withCredentials: true });
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear session and redirect
        localStorage.removeItem('admin_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
