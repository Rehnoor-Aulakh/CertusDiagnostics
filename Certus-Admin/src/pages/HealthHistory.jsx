import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

import HealthSummaryCard from "../components/history/HealthSummaryCard";
import HealthFilterBar from "../components/history/HealthFilterBar";
import HealthGraphCarousel from "../components/history/HealthGraphCarousel";
import HealthAccordion from "../components/history/HealthAccordion";
import LoadingSpinner from "../components/LoadingSpinner";
import API_ENDPOINTS from "../utils/api";

export default function HealthHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  // we need to fetch the state that contains patient email from the previous Patients page
  const patientEmail = typeof location.state === 'string' ? location.state : location.state?.email;
  const patientName = location.state?.name;

  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeFilter, setTimeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");


  const fetchHistory = useCallback(async () => {

    try {

      setLoading(true);
      setError(null);
      const rawAdminData = localStorage.getItem("adminUser");
      const token = rawAdminData ? JSON.parse(rawAdminData).token : null;
      const response = await fetch(`${API_ENDPOINTS.patient_history}?email=${encodeURIComponent(patientEmail)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      setHistoryData(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your health history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (patientEmail) {
      fetchHistory();
    }
  }, [patientEmail, fetchHistory]);

  const filteredTests = useMemo(() => {
    if (!historyData?.graphs) return [];

    let tests = historyData.graphs.map((test) => {
      // 1. Filter timeline points by date
      let filteredTimeline = test.timeline;
      if (timeFilter !== "All") {
        const now = new Date();
        let cutoffDate = new Date();
        if (timeFilter === "3 Months") cutoffDate.setMonth(now.getMonth() - 3);
        else if (timeFilter === "6 Months") cutoffDate.setMonth(now.getMonth() - 6);
        else if (timeFilter === "1 Year") cutoffDate.setFullYear(now.getFullYear() - 1);

        filteredTimeline = test.timeline.filter((point) => new Date(point.date) >= cutoffDate);
      }
      return { ...test, timeline: filteredTimeline };
    });

    // 2. Filter tests by status
    if (statusFilter !== "All") {
      tests = tests.filter((test) => {
        if (statusFilter === "Worsening") return test.status === "WORSENING";
        if (statusFilter === "Needs Attention") return test.status === "NEEDS_ATTENTION";
        if (statusFilter === "Improving") return test.status === "IMPROVING";
        if (statusFilter === "Recovered") return test.status === "RECOVERED";
        if (statusFilter === "Stable Normal") return test.status === "STABLE_NORMAL";
        if (statusFilter === "Abnormal") return test.status === "ABNORMAL";
        return true;
      });
    }

    // 3. Filter tests by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tests = tests.filter(
        (test) =>
          (test.testName && test.testName.toLowerCase().includes(q)) ||
          (test.category && test.category.toLowerCase().includes(q))
      );
    }

    return tests;
  }, [historyData, timeFilter, statusFilter, searchQuery]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICA8L3BhdHRlcm4+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgogICAgPC9zdmc+')] opacity-30"></div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-3xl font-bold mb-6 text-white">Health History</h1>
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-white/5 rounded-2xl"></div>
            <div className="h-16 bg-white/5 rounded-xl"></div>
            <div className="h-80 bg-white/5 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICA8L3BhdHRlcm4+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgogICAgPC9zdmc+')] opacity-30"></div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-3xl font-bold mb-6 text-white">Health History</h1>
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center glass-card flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">{error}</h2>
            <button
              onClick={fetchHistory}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!historyData || (historyData.graphs.length === 0 && !historyData.summary)) {
    return (
      <div className="-m-6 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICA8L3BhdHRlcm4+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgogICAgPC9zdmc+')] opacity-30"></div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <button 
                onClick={() => navigate(-1)} 
                className="text-blue-300 hover:text-white flex items-center gap-2 mb-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Patients
              </button>
              <h1 className="text-3xl font-bold text-white">Health History Dashboard</h1>
            </div>
            {patientEmail && (
              <div className="text-left md:text-right">
                <div className="text-white font-semibold text-lg">{patientName || "Patient"}</div>
                <div className="text-blue-200 text-sm">{patientEmail}</div>
              </div>
            )}
          </div>
          <div className="bg-white/5 rounded-2xl p-12 text-center glass-card flex flex-col items-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-white mb-2">No health history available yet.</h2>
            <p className="text-gray-400">Upload more reports to begin tracking trends.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICA8L3BhdHRlcm4+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgogICAgPC9zdmc+')] opacity-30"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="text-blue-300 hover:text-white flex items-center gap-2 mb-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Patients
            </button>
            <h1 className="text-3xl font-bold text-white">Health History Dashboard</h1>
          </div>
          {patientEmail && (
            <div className="text-left md:text-right">
              <div className="text-white font-semibold text-lg">{patientName || "Patient"}</div>
              <div className="text-blue-200 text-sm">{patientEmail}</div>
            </div>
          )}
        </div>

        {historyData.summary && (
          <HealthSummaryCard summary={historyData.summary} />
        )}

        <HealthFilterBar
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {filteredTests.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-12 text-center glass-card mt-8 flex flex-col items-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-white mb-2">No matching tests found.</h2>
            <p className="text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <>
            <HealthGraphCarousel tests={filteredTests} timeFilter={timeFilter} />
            <HealthAccordion tests={filteredTests} />
          </>
        )}
      </div>
    </div>
  );
}
