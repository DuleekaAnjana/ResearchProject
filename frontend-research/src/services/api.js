/**
 * Spring Boot API Service
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `GET ${endpoint} failed with status ${response.status}`);
    }
    return data;
  },

  post: async (endpoint, payload) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `POST ${endpoint} failed with status ${response.status}`);
    }
    return data;
  },

  put: async (endpoint, payload) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `PUT ${endpoint} failed with status ${response.status}`);
    }
    return data;
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `DELETE ${endpoint} failed with status ${response.status}`);
    }
    return data;
  },
};

export default api;
