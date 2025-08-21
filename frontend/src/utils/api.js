import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Event API endpoints
export const eventAPI = {
  // Get all events with optional filters
  getEvents: (params = {}) => api.get('/events', { params }),
  
  // Get single event by ID
  getEvent: (id) => api.get(`/events/${id}`),
  
  // Create new event (admin)
  createEvent: (eventData) => api.post('/events', eventData),
  
  // Update event (admin)
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  
  // Delete event (admin)
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

// Authentication API endpoints
export const authAPI = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register
  register: (userData) => api.post('/auth/register', userData),
  
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Admin API endpoints
export const adminAPI = {
  // Get all users
  getUsers: () => api.get('/admin/users'),
  
  // Delete user
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Get analytics
  getAnalytics: () => api.get('/events/analytics'),
};

// Booking API endpoints
export const bookingAPI = {
  // Create booking
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  
  // Get bookings with optional filters
  getBookings: (params = {}) => api.get('/bookings', { params }),
  
  // Get booking by ID
  getBooking: (id) => api.get(`/bookings/${id}`),
  
  // Get booking analytics (admin only)
  getAnalytics: () => api.get('/bookings/analytics'),
};

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Local storage utilities
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || error.response.data?.error || 'Server error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

// Debounce utility
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export default api;
