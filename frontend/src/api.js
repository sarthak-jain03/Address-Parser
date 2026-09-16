import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Address API methods
export const addressAPI = {
  // Parse a single address
  parse: (raw_address) => api.post('/addresses/parse', { raw_address }),

  // Parse multiple addresses in bulk
  parseBulk: (addresses) => api.post('/addresses/parse-bulk', { addresses }),

  // Get all addresses with optional filters
  getAll: (params = {}) => api.get('/addresses', { params }),

  // Get a single address by ID
  getById: (id) => api.get(`/addresses/${id}`),

  // Update an address
  update: (id, data) => api.put(`/addresses/${id}`, data),

  // Delete an address
  delete: (id) => api.delete(`/addresses/${id}`),

  // Get dashboard stats
  getStats: () => api.get('/addresses/stats'),
};

export default api;
