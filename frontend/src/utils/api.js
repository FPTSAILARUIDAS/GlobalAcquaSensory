// Dynamic API URL configuration
// This ensures the frontend always calls the correct backend based on the current domain

const getApiUrl = () => {
  // If REACT_APP_BACKEND_URL is set and valid, use it
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  
  // In production (deployed), use the current origin
  // In development, use the environment variable
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // If we're on the deployed domain (emergent.host), use the same origin
    if (currentHost.includes('emergent.host')) {
      return window.location.origin;
    }
    
    // If we're on preview domain, use the same origin
    if (currentHost.includes('preview.emergentagent.com')) {
      return window.location.origin;
    }
  }
  
  // Fallback to environment variable or empty string
  return envUrl || '';
};

export const BACKEND_URL = getApiUrl();
export const API = `${BACKEND_URL}/api`;

export default { BACKEND_URL, API };
