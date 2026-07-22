import React from "react";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Activity, Minus } from "lucide-react";

export const statusColors = {
  WORSENING: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: TrendingDown,
    label: "Worsening",
    dot: "red",
  },
  ABNORMAL: {
    bg: "bg-rose-900/40",
    text: "text-rose-400",
    border: "border-rose-500/30",
    icon: AlertTriangle,
    label: "Abnormal",
    dot: "red",
  },
  NEEDS_ATTENTION: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    icon: Activity,
    label: "Needs Attention",
    dot: "orange",
  },
  IMPROVING: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: TrendingUp,
    label: "Improving",
    dot: "green",
  },
  RECOVERED: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/30",
    icon: CheckCircle,
    label: "Recovered",
    dot: "green",
  },
  STABLE_NORMAL: {
    bg: "bg-teal-500/20",
    text: "text-teal-400",
    border: "border-teal-500/30",
    icon: Minus,
    label: "Stable Normal",
    dot: "green",
  },
};

export default function HealthStatusBadge({ status }) {
  if (!status || !statusColors[status]) return null;

  const config = statusColors[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3.5 h-3.5 mr-1" />
      {config.label}
    </span>
  );
}
