import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// const BASE_URL = import.meta.env.VITE_API_URL || 'https://makuto-backend-public-1.onrender.com';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores globales
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('No autorizado, redireccionando al login...');
            // Aquí puedes redirigir al login si usas React Router
        }
        return Promise.reject(error);
    }
);

export default api;