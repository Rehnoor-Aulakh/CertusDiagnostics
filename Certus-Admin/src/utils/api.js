// Vite exposes only variables prefixed with VITE_ to browser code. Do not put
// passwords, API secrets, or private keys in this file or the admin .env file.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL;

if (!API_BASE_URL || !UPLOAD_BASE_URL) {
  throw new Error("Missing API configuration. Add it to Certus-Admin/.env.");
}

export const API_ENDPOINTS = {
  // Admin endpoints
  adminGoogleAuth: `${API_BASE_URL}/auth/google-login`,

  // Dashboard endpoints
  dashboard: `${API_BASE_URL}/admin/dashboard`,

  // Patient endpoints
  patients: `${API_BASE_URL}/admin/patients`,

  // Report endpoints
  reports: `${API_BASE_URL}/admin/reports`,
  upload: `${API_BASE_URL}/admin/reports/upload`,

  // Report view URL builder (uses the authenticated API endpoint)
  getReportUrl: (filename) => `${API_BASE_URL}/admin/reports/view/${encodeURIComponent(filename)}`,
};

export default API_ENDPOINTS;
