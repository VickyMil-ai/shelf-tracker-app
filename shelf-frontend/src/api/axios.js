import axios from 'axios';

const defaultBaseURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : '/api';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || defaultBaseURL,
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
