import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Make this configurable via env if needed
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login if unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Ideally trigger a redirect or state change via context, 
            // but for now we just clear storage. 
            // window.location.href = '/login'; // Use with caution in SPA
        }
        return Promise.reject(error);
    }
);

export default api;
