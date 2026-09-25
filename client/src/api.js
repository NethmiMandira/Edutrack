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

// Endpoints that are tutor-only on the server (see server.js requireTutor middleware).
// These must always use the tutor token, never the student token, even if a
// studentToken is also present in localStorage.
const TUTOR_ONLY_PATHS = ['/students', '/subjects', '/categories', '/marks'];

// Add request interceptor for logging
API.interceptors.request.use(
  config => {
    const tutorToken = localStorage.getItem('tutorToken');
    const studentToken = localStorage.getItem('studentToken');

    // Normalize the request path (strip baseURL/query string) so matching is reliable
    const requestPath = (config.url || '').split('?')[0];
    const isTutorOnlyPath = TUTOR_ONLY_PATHS.some(p => requestPath.startsWith(p));

    // GET /marks is allowed for students too — only force the tutor token
    // for /marks when it's not a GET (POST/PUT/DELETE are tutor-only).
    const isStudentAllowedMarksGet =
      requestPath.startsWith('/marks') && (config.method || 'get').toLowerCase() === 'get';

    let token;
    if (isTutorOnlyPath && !isStudentAllowedMarksGet) {
      // Tutor-only endpoint: never fall back to a stray studentToken
      token = tutorToken;
    } else {
      // Shared/student endpoint (including GET /marks): prefer the tutor
      // token when one exists. This prevents a stale studentToken left in
      // localStorage (e.g. from testing the student login in the same
      // browser) from silently hijacking a tutor's request and scoping
      // GET /marks down to just that one student's records. Only fall
      // back to studentToken when there's genuinely no tutor session,
      // i.e. this really is a student using the app.
      token = tutorToken || studentToken;
    }

    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
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