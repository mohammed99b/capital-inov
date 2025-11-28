import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const baseURL = (import.meta as any).env.VITE_API_URL || '/api';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { addToast } = useToastStore.getState();

    // 1. Log error for debugging
    console.error("Global API Error Interceptor:", error);

    // 2. Handle specific status codes globally
    if (!error.response) {
      // Network Error (server down, cors issues, etc)
      addToast("Impossible de contacter le serveur. Vérifiez votre connexion internet.", "error");
    } else {
      const status = error.response.status;

      if (status >= 500) {
        addToast("Une erreur serveur est survenue. Veuillez réessayer plus tard.", "error");
      } else if (status === 403) {
        addToast("Vous n'avez pas les permissions nécessaires pour effectuer cette action.", "error");
      } else if (status === 404) {
        // Only show 404 toast if it's not a GET request (GET 404 might just mean empty list or handled by UI)
        if (error.config.method !== 'get') {
             addToast("Ressource introuvable.", "warning");
        }
      } else if (status === 401) {
        // Handle Logout logic
        useAuthStore.getState().logout();
        if (!window.location.pathname.includes('/login')) {
            addToast("Votre session a expiré. Veuillez vous reconnecter.", "warning");
            window.location.href = '/login';
        }
      }
      
      // Note: 400 Bad Request is typically a validation error. 
      // We pass it through to the component to handle specific field errors.
    }

    return Promise.reject(error);
  }
);
