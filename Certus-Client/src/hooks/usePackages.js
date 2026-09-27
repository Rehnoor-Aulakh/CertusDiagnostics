import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchPackages } from "../lib/apiClient";

export const usePackageCategories = () => {
  return useQuery({
    queryKey: ["package-categories"],
    queryFn: fetchCategories,
    // keep the categories fresh for 10 minutes
    staleTime: 10 * 60 * 1000,
  });
};

export const useDiagnosticPackages = () => {
  return useQuery({
    queryKey: ["diagnostic-packages"],
    queryFn: fetchPackages,
    staleTime: 10 * 60 * 1000,
  });
};
