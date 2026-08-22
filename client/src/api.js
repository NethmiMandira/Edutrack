import axios from 'axios';

// Detect environment and set API base URL
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isDevelopment 
  ? 'http://localhost:5000/api'  // Development: Local backend
  : 'https://api.skmathzone.com/api';  // Production: Hostinger backend

// Log API configuration only in development
if (isDevelopment) {
  console.log(`🔌 API Configuration:
    Environment: DEVELOPMENT
    Hostname: ${window.location.hostname}
    Base URL: ${baseURL}`);
}

const API = axios.create({
  baseURL: baseURL
});

// Add request interceptor for logging
API.interceptors.request.use(
  config => {
    if (isDevelopment) {
      console.log(`📤 Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  error => {
    if (isDevelopment) {
      console.error(`❌ Request failed:`, error.message);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
API.interceptors.response.use(
  response => {
    if (isDevelopment) {
      console.log(`📥 Response: ${response.config.url} (${response.status}) - ${response.data?.length || 0} items`);
    }
    return response;
  },
  error => {
    if (isDevelopment) {
      const url = error.config?.url || 'unknown';
      const status = error.response?.status || 'no status';
      const message = error.response?.data?.error || error.message;
      console.error(`❌ Response Error: ${url} (${status}) - ${message}`);
    }
    return Promise.reject(error);
  }
);

export default API;