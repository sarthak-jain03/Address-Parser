import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const addressAPI = {
  parse: (raw_address) => api.post('/addresses/parse', { raw_address }),

  parseBulk: (addresses) => api.post('/addresses/parse-bulk', { addresses }),

  getAll: (params = {}) => api.get('/addresses', { params }),

  getById: (id) => api.get(`/addresses/${id}`),

  update: (id, data) => api.put(`/addresses/${id}`, data),

  delete: (id) => api.delete(`/addresses/${id}`),

  getStats: () => api.get('/addresses/stats'),
};

export default api;
