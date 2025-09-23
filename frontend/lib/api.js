// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      me: (userId) => `/api/auth/me/${userId}`
    },
    recipes: {
      generate: '/api/recipes/generate',
      byUser: (userId) => `/api/recipes/user/${userId}`,
      byId: (id) => `/api/recipes/${id}`,
      delete: (id) => `/api/recipes/${id}`
    },
    kitchen: {
      byUser: (userId) => `/api/kitchen/${userId}`,
      save: '/api/kitchen'
    }
  }
};

export default apiConfig;