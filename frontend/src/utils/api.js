import axios from "axios";

// Dynamic API URL configuration
// Always uses the current browser origin so the app works on any domain
// (custom domain, preview, production) without reconfiguration

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.REACT_APP_BACKEND_URL || '';
};

export const BACKEND_URL = getApiUrl();
export const API = `${BACKEND_URL}/api`;

// Auto-retry transient failures (server restarts / bad gateway) for GET requests
const TRANSIENT_STATUSES = [502, 503, 504];
const MAX_RETRIES = 3;

axios.interceptors.response.use(undefined, async (error) => {
  const cfg = error.config;
  if (cfg) {
    const method = (cfg.method || "get").toLowerCase();
    const status = error.response?.status;
    const isTransient = !error.response || TRANSIENT_STATUSES.includes(status);
    const retryCount = cfg.__retryCount || 0;
    if (method === "get" && isTransient && retryCount < MAX_RETRIES) {
      cfg.__retryCount = retryCount + 1;
      await new Promise((r) => setTimeout(r, 2500 * cfg.__retryCount));
      return axios(cfg);
    }
  }
  return Promise.reject(error);
});

export default { BACKEND_URL, API };
