import { useQuery } from "@tanstack/react-query";
import { fetchPatientReviews } from "../lib/apiClient";

export const usePatientReviews = () => {
  return useQuery({
    queryKey: ["patient-reviews"],
    queryFn: fetchPatientReviews,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
};
