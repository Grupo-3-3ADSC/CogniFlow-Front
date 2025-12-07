import axios from 'axios'
export const microservico = axios.create({
    baseURL: import.meta.env.MICROSERVICO_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

microservico.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);