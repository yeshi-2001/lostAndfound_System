import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Set default content type for non-FormData requests
api.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Clean the token of any HTML entities or extra characters
    let cleanToken = token.replace(/&quot;/g, '').replace(/"/g, '').trim();
    
    // Validate token format (JWT should have 3 parts separated by dots)
    if (!cleanToken.includes('.') || cleanToken.split('.').length !== 3) {
      console.error('Invalid token format detected, clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return config;
    }
    
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', email),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// Items API
export const itemsAPI = {
  submitFoundItem: (itemData) => api.post('/found-items', itemData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  submitLostItem: (itemData) => api.post('/lost-items', itemData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getFoundItems: () => api.get('/found-items'),
  getLostItems: () => api.get('/lost-items'),
  getFormOptions: () => api.get('/form-options'),
  uploadImages: (formData) => api.post('/upload-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Verification API
export const verificationAPI = {
  getMatches: () => api.get('/matches/user'),
  generateQuestions: (matchId) => api.post('/verification/generate-questions', { match_id: matchId }),
  submitAnswers: (matchId, answers) => api.post('/verification/verify-answers', { match_id: matchId, answers }),
  getContactInfo: (matchId) => api.get(`/matches/${matchId}/contact`),
};

// Returns API
export const returnsAPI = {
  confirmReturn: (matchId) => api.post(`/returns/confirm/${matchId}`, {}),
  getReturnStatus: (matchId) => api.get(`/returns/status/${matchId}`),
};

// Notifications API
export const notificationAPI = {
  getNotifications: (token) => api.get('/notifications'),
  markAsRead: (notificationId, token) => api.put(`/notifications/${notificationId}/read`),
};

// Debug API
export const debugAPI = {
  getDatabaseInfo: () => api.get('/debug/database'),
};

export default api;