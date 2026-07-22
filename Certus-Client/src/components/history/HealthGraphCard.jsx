import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import HealthStatusBadge, { statusColors } from "./HealthStatusBadge";

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;
  
  const isAbnormal = payload.abnormal;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={isAbnormal ? "#ef4444" : "#10b981"}
      stroke="#1e293b"
      strokeWidth={2}
    />
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isAbnormal = data.abnormal;
    
    // Format date string from backend (e.g., "2026-06-10" to "10 Jun 2026")
    const dateObj = new Date(data.date);
    const dateStr = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl">
        <p className="text-gray-300 font-medium mb-1">{dateStr}</p>
        <p className="text-xl font-bold text-white mb-1">
          {data.value} {data.unit || ""}
        </p>
        <p className={`text-sm font-medium ${isAbnormal ? "text-red-400" : "text-green-400"}`}>
          {isAbnormal ? "Abnormal" : "Normal"}
        </p>
      </div>
    );
  }
  return null;
};

export default function HealthGraphCard({ test }) {
  if (!test) return null;

  const data = [...test.timeline].reverse(); // oldest to newest for chart (X axis left to right)
  const isSinglePoint = data.length === 1;
  const latestPoint = test.timeline[0]; // test.timeline is originally newest first

  const statusConfig = statusColors[test.status];

  // Helper to format date for X Axis ticks
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-card h-full flex flex-col min-w-full lg:min-w-[600px] shrink-0 snap-center transition-all">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{test.testName}</h3>
          <p className="text-sm text-gray-400 uppercase tracking-wider">{test.category}</p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <HealthStatusBadge status={test.status} />
          {statusConfig && (
             <span className="text-xs text-gray-500 mt-1">Trend: {statusConfig.label}</span>
          )}
        </div>
      </div>

      {/* Latest Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Current Value</p>
          <p className={`text-2xl font-bold ${latestPoint?.abnormal ? "text-red-400" : "text-green-400"}`}>
            {latestPoint?.value !== undefined && latestPoint?.value !== null ? latestPoint.value : "--"}
            <span className="text-sm font-normal text-gray-400 ml-1">{test.unit}</span>
          </p>
        </div>
        <div className="bg-black/20 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Reference Range</p>
          <p className="text-lg font-semibold text-white">
            {test.referenceRange || "N/A"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[250px] relative">
        {isSinglePoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700 backdrop-blur-sm">
            <p className="text-xs text-gray-300">Only one report available</p>
          </div>
        )}
        
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                minTickGap={20}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4b5563', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 7, strokeWidth: 0 }}
                isAnimationActive={true}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No data points in this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
