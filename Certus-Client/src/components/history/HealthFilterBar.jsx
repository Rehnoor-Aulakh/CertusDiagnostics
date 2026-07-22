import React from "react";
import { Search } from "lucide-react";

export default function HealthFilterBar({
  timeFilter,
  setTimeFilter,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) {
  const timeOptions = ["3 Months", "6 Months", "1 Year", "All"];
  const statusOptions = [
    "All",
    "Worsening",
    "Abnormal",
    "Needs Attention",
    "Improving",
    "Recovered",
    "Stable Normal",
  ];

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search test names or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          />
        </div>

        {/* Date Filter */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full lg:w-auto overflow-x-auto">
          {timeOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setTimeFilter(opt)}
              className={`flex-1 lg:flex-none px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                timeFilter === opt
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
        {statusOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setStatusFilter(opt)}
            className={`flex-1 px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === opt
                ? "bg-gray-700 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
