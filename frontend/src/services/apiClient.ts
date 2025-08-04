import axios from 'axios'

const apiClient = axios.create({ 
  baseURL: '/api/v1',
  timeout: 120000, // 2 minutes timeout for formulation generation
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - the formulation is taking too long. Please try again with a simpler request.';
    }
    return Promise.reject(error);
  }
);

export default apiClient
