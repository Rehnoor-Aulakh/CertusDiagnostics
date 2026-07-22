import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { API_BASE_URL } from "../config/api";
import ReportDetails from "../components/ReportDetails";
import { data } from "autoprefixer";

export default function YourReports() {
  const { isLoggedIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/sign-in");
    }
  }, [isLoggedIn, loading, navigate]);

  useEffect(() => {
    console.log("History useEffect executed");
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/patient/history`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        console.log("Status:", response.status);

        const data = await response.json();

        console.log("History Response:", data);
      } catch (error) {
        console.error("History fetch failed:", error);
      }
    };

    if (user?.token) {
      fetchHistory();
    }
  }, [user?.token]);

  const fetchUserReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patient/reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();

      if (data.success) {
        // The backend now returns { success: true, reports: [...] }
        const userReports = data.reports.map((report) => ({
          id: report.id,
          test_name: report.test_name,
          date: report.date || new Date().toISOString().split("T")[0],
          status: report.status === "COMPLETED" ? "Ready" : "Pending",
        }));
        setReports(userReports);
      } else {
        console.error("Failed to fetch reports:", data.message);
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  }, [user?.token]);

  // Fetch user reports when user is logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchUserReports();
    }
  }, [isLoggedIn, user, fetchUserReports]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <LoadingSpinner
          size="large"
          color="white"
          text="Checking authentication..."
        />
      </div>
    );
  }

  // Show redirecting message if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <LoadingSpinner
          size="large"
          color="white"
          text="Redirecting to sign in..."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICA8L3BhdHRlcm4+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgogICAgPC9zdmc+')] opacity-30"></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {selectedReportId ? (
          <ReportDetails
            reportId={selectedReportId}
            onBack={() => setSelectedReportId(null)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Your Reports
              </h1>
              <p className="text-gray-300 text-lg">
                Welcome back, {user?.name}! Here are your test reports.
              </p>
            </div>

            {/* Reports Section */}
            {isLoadingReports ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner
                  size="large"
                  color="white"
                  text="Loading your reports..."
                />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {reports.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
                    <div className="text-gray-300 text-lg mb-4">
                      No reports found
                    </div>
                    <p className="text-gray-400">
                      Your test reports will appear here once they are ready.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {report.test_name}
                            </h3>
                            <div className="text-gray-300 space-y-1">
                              <p>
                                Date:{" "}
                                {new Date(report.date).toLocaleDateString()}
                              </p>
                              <div className="flex items-center">
                                <span className="mr-2">Status:</span>
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    report.status === "Ready"
                                      ? "bg-green-600 text-green-100"
                                      : report.status === "Pending"
                                        ? "bg-orange-600 text-orange-100"
                                        : "bg-yellow-600 text-yellow-100"
                                  }`}
                                >
                                  {report.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            {report.status === "Ready" ? (
                              <button
                                onClick={() => setSelectedReportId(report.id)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transform hover:scale-105 transition"
                              >
                                View Report
                              </button>
                            ) : (
                              <span className="text-gray-400 px-6 py-2">
                                Report pending...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
