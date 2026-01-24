import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error: AxiosError) => {
        // Don't auto-redirect if getting 401 on login page (wrong password)
        if (error.response && error.response.status === 401 && !error.config?.url?.includes('login')) {
            // Auto logout if 401 on other requests
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Check if we are in browser before using window
            if (typeof window !== 'undefined') {
                // window.location.href = '/login'; // Disabled auto-redirect to allow public pages to partially load
            }
        }
        return Promise.reject(error);
    }
);
