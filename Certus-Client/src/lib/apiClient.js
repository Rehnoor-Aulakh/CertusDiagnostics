import axios from "axios";
import { API_BASE_URL } from "../config/api";

// central axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fetch Categories
export const fetchCategories = async () => {
  try {
    const { data } = await apiClient.get("/viewer/package-categories");
    return data.success ? data.data : [];
  } catch (error) {
    const { data } = await apiClient.get("/package-categories");
    return data.success ? data.data : [];
  }
};

// Fetch Packages
export const fetchPackages = async () => {
  try {
    const { data } = await apiClient.get("/viewer/packages");
    return data.success ? data.data : [];
  } catch (error) {
    const { data } = await apiClient.get("/packages");
    return data.success ? data.data : [];
  }
};

// Fetch Patient Reports
export const fetchPatientReports = async (token) => {
  const { data } = await apiClient.get("/patient/reports", {
    headers: { Authorization: `Bearer ${token}` },
  });
  // return the array of reports if successful
  return data.success ? data.reports : [];
};

// Fetch Patient Health History
export const fetchPatientHistory = async (token) => {
  const { data } = await apiClient.get("/patient/history", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};
