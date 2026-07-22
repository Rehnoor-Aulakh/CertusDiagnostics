import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import HealthStatusBadge from "./HealthStatusBadge";

function HealthTimelineTable({ timeline, unit }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="overflow-x-auto mt-4 rounded-xl border border-white/10">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs uppercase bg-black/20 text-gray-400">
          <tr>
            <th className="px-6 py-3 font-semibold">Date</th>
            <th className="px-6 py-3 font-semibold">Value</th>
            <th className="px-6 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {timeline.map((point, idx) => {
            const dateObj = new Date(point.date);
            const dateStr = dateObj.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">{dateStr}</td>
                <td className="px-6 py-4 font-medium text-white">
                  {point.value !== undefined && point.value !== null ? point.value : "--"} {unit}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${point.abnormal ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                    {point.abnormal ? "Abnormal" : "Normal"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HealthAccordionRow({ test }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const latestPoint = test.timeline[0];

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group text-left"
      >
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-semibold text-white truncate">{test.testName}</p>
          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
            <span>Ref: {test.referenceRange || "N/A"}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 mb-0.5">Latest</p>
            <p className={`font-bold ${latestPoint?.abnormal ? "text-red-400" : "text-green-400"}`}>
              {latestPoint?.value !== undefined && latestPoint?.value !== null ? latestPoint.value : "--"}
              <span className="text-xs font-normal text-gray-500 ml-1">{test.unit}</span>
            </p>
          </div>
          
          <div className="w-28 flex justify-end">
             <HealthStatusBadge status={test.status} />
          </div>

          <div className="text-gray-500 group-hover:text-white transition-colors">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Expandable Content with CSS transition */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mb-4" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden px-4">
          <HealthTimelineTable timeline={test.timeline} unit={test.unit} />
        </div>
      </div>
    </div>
  );
}

function HealthAccordionSection({ category, tests }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl glass-card overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-black/20 hover:bg-black/30 transition-colors text-left"
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">{category}</h3>
          <span className="bg-white/10 text-gray-300 py-0.5 px-2.5 rounded-full text-xs font-medium">
            {tests.length}
          </span>
        </div>
        <div className="text-gray-400">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out ${isOpen ? "block" : "hidden"}`}>
        <div className="flex flex-col">
          {tests.map((test, idx) => (
            <HealthAccordionRow key={`${test.testName}-${idx}`} test={test} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HealthAccordion({ tests }) {
  // Group tests by category, preserving backend order
  const grouped = useMemo(() => {
    if (!tests) return [];
    
    const map = new Map();
    tests.forEach((test) => {
      const cat = test.category || "GENERAL";
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat).push(test);
    });

    return Array.from(map.entries()).map(([category, categoryTests]) => ({
      category,
      tests: categoryTests,
    }));
  }, [tests]);

  if (grouped.length === 0) return null;

  return (
    <div className="w-full mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Detailed Test History</h2>
      {grouped.map(({ category, tests: categoryTests }) => (
        <HealthAccordionSection key={category} category={category} tests={categoryTests} />
      ))}
    </div>
  );
}
