import axios from 'axios'

// Environment-specific configuration
const isProduction = window.location.hostname !== 'localhost'
const timeout = isProduction ? 300000 : 120000 // 5 minutes for production (cold starts), 2 minutes for local

const apiClient = axios.create({ 
  baseURL: '/api/v1',
  timeout: timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for deployment debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for deployment environments
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle different error scenarios in deployment
    if (error.code === 'ECONNABORTED') {
      if (isProduction) {
        error.message = 'Server is starting up (cold start). This may take up to 2 minutes. Please wait...';
      } else {
        error.message = 'Request timeout - the formulation is taking too long. Please try again with a simpler request.';
      }
    } else if (error.response?.status === 502 || error.response?.status === 503) {
      error.message = 'Backend service is starting up. Please wait a moment and try again.';
    } else if (error.response?.status === 504) {
      error.message = 'Gateway timeout - the server took too long to respond. Please try again.';
    } else if (!error.response) {
      error.message = 'Network error - please check your connection and try again.';
    }
    
    console.error(`❌ API Error: ${error.message}`, error);
    return Promise.reject(error);
  }
);

export default apiClient
