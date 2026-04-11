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

export default { BACKEND_URL, API };
