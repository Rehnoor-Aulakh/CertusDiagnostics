// API Configuration
// This file provides centralized API endpoint configuration based on environment

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL;

if (!API_BASE_URL || !UPLOAD_BASE_URL) {
  throw new Error("Missing API configuration. Add it to Certus-Client/.env.");
}

export { API_BASE_URL, UPLOAD_BASE_URL };

// Helper function to get full image URL (for packages, categories, reports, etc.)
export const getImageUrl = (filename, folder = "packages") => {
  if (!filename) return null;
  if (
    filename.startsWith("http://") ||
    filename.startsWith("https://") ||
    filename.startsWith("data:")
  ) {
    return filename;
  }
  const cleanFilename = filename.replace(/^\/+/, "");
  if (cleanFilename.startsWith("uploads/")) {
    return `${UPLOAD_BASE_URL.replace(/\/uploads\/?$/, "")}/${cleanFilename}`;
  }
  if (cleanFilename.startsWith(`${folder}/`)) {
    return `${UPLOAD_BASE_URL}/${cleanFilename}`;
  }
  return `${UPLOAD_BASE_URL}/${folder}/${cleanFilename}`;
};

// Usage in components:
// import { API_BASE_URL, getImageUrl } from '../config/api';
// const response = await fetch(`${API_BASE_URL}/viewer/packages`, {...});
