// Auto-detect: use environment variable if set at build time,
// otherwise detect at runtime whether we are on localhost or deployed.
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'https://digitalcafe.onrender.com/api');

export default API_BASE_URL;
