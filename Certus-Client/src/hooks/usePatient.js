import { useQuery } from "@tanstack/react-query";
import { fetchPatientHistory, fetchPatientReports } from "../lib/apiClient";

export const usePatientReports = (token) => {
  return useQuery({
    queryKey: ["patient-reports", token],
    queryFn: () => fetchPatientReports(token),
    // only fetch if the token exists
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePatientHistory = (token) => {
  return useQuery({
    queryKey: ["patient-history", token],
    queryFn: () => fetchPatientHistory(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};
