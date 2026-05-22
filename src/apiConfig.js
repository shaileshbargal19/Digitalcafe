// Auto-detect: use environment variable in production, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default API_BASE_URL;
