import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});

// Fonction pour obtenir le token CSRF
export const getCsrfToken = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/csrf-token`, { withCredentials: true });
        return response.data.csrfToken;
    } catch (error) {
        console.error('Erreur lors de la récupération du token CSRF:', error);
        return null;
    }
};

// Interceptor pour ajouter le token CSRF aux requêtes non-GET
api.interceptors.request.use(async (config) => {
    if (config.method !== 'get') {
        const csrfToken = await getCsrfToken();
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;