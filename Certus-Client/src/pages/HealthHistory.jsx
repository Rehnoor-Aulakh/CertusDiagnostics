import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "../config/api";

import HealthSummaryCard from "../components/history/HealthSummaryCard";
import HealthFilterBar from "../components/history/HealthFilterBar";
import HealthGraphCarousel from "../components/history/HealthGraphCarousel";
import HealthAccordion from "../components/history/HealthAccordion";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HealthHistory() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeFilter, setTimeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/sign-in");
    }
  }, [isLoggedIn, authLoading, navigate]);

  const fetchHistory = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/patient/history`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
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
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchHistory();
    }
  }, [isLoggedIn, fetchHistory]);

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

  if (authLoading) return <LoadingSpinner fullScreen />;

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICA8L3BhdHRlcm4+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgogICAgPC9zdmc+')] opacity-30"></div>
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-3xl font-bold mb-6 text-white">Health History</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICA8L3BhdHRlcm4+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgogICAgPC9zdmc+')] opacity-30"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <h1 className="text-3xl font-bold text-white">Health History Dashboard</h1>

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
