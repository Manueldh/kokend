// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      me: (userId) => `/api/auth/me/${userId}`,
      preferences: (userId) => `/api/auth/preferences/${userId}`
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

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const api = {
  async login(username) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.auth.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    
    return handleResponse(response);
  },

  async getUser(userId) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.auth.me(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  async getUserPreferences(userId) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.auth.preferences(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  async updateUserPreferences(userId, preferences) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.auth.preferences(userId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferences }),
    });
    
    return handleResponse(response);
  },

  async generateRecipe({ mealType, preferences, allergies }) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.recipes.generate}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        mealType, 
        preferences: preferences || {},
        allergies: allergies || []
      }),
    });
    
    return handleResponse(response);
  },

  async getUserRecipes(userId) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.recipes.byUser(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  async getRecipeById(id) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.recipes.byId(id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  async deleteRecipe(id) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.recipes.byId(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  async getUserKitchen(userId) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.kitchen.byUser(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  async saveKitchen(userId, appliances) {
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.kitchen.save}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, appliances }),
    });
    
    return handleResponse(response);
  },
};

export default apiConfig;