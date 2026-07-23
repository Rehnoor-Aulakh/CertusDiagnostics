import React, { useEffect, useState } from "react";
import { statusColors } from "./HealthStatusBadge";

function CircularProgress({ percentage }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500; // 1.5s
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCurrent(Math.round(ease * percentage));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [percentage]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (current / 100) * circumference;

  let colorClass = "text-red-500";
  if (current > 40) colorClass = "text-orange-500";
  if (current > 70) colorClass = "text-green-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          className="text-white/10"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
        />
        <circle
          className={`${colorClass} transition-all duration-300 ease-out`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{current}</span>
        <span className="text-xs text-gray-400">Score</span>
      </div>
    </div>
  );
}

function StatusChip({ status, count, label }) {
  const config = statusColors[status];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${config.bg} ${config.border}`}>
      <div className={`flex items-center space-x-1 ${config.text} mb-1`}>
        <Icon className="w-4 h-4" />
        <span className="font-semibold">{count}</span>
      </div>
      <span className="text-xs text-gray-400 text-center">{label}</span>
    </div>
  );
}

export default function HealthSummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-card overflow-hidden relative">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Left Side: Score & Total */}
        <div className="flex flex-col items-center md:items-start md:w-1/3">
          <h2 className="text-xl font-semibold text-white mb-2">Overall Health</h2>
          <p className="text-sm text-gray-400 text-center md:text-left mb-6 min-h-[40px]">
            {summary.heading || "Your health trends are being tracked."}
          </p>
          
          <div className="flex items-center space-x-6">
            <CircularProgress percentage={summary.healthScore} />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{summary.totalTests}</span>
              <span className="text-sm text-gray-400">Tracked Tests</span>
            </div>
          </div>
        </div>

        {/* Right Side: Chips */}
        <div className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatusChip status="WORSENING" count={summary.worsening} label="Worsening" />
          <StatusChip status="ABNORMAL" count={summary.abnormal} label="Abnormal" />
          <StatusChip status="NEEDS_ATTENTION" count={summary.needsAttention} label="Needs Attention" />
          <StatusChip status="IMPROVING" count={summary.improving} label="Improving" />
          <StatusChip status="RECOVERED" count={summary.recovered} label="Recovered" />
          <StatusChip status="STABLE_NORMAL" count={summary.stableNormal} label="Stable Normal" />
        </div>
      </div>
    </div>
  );
}
