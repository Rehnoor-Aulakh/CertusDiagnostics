import React, { useState } from "react";
import { getImageUrl } from "../../config/api";
import ClientPackageCard from "./ClientPackageCard";
import { ChevronDown, ChevronUp, Sparkles, ShieldCheck, Activity, Layers } from "lucide-react";

/**
 * ClientCategorySection Component
 * Renders a diagnostic package category section in the Certus Client Application.
 * Includes a sleek header with category icon/avatar, package count badge, and collapsible grid of package cards.
 */
export default function ClientCategorySection({ category, packages = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!packages || packages.length === 0) return null;

  const categoryName = category?.name || "General Screenings & Packages";
  const categoryImage = getImageUrl(category?.imageUrl, "package-categories") || getImageUrl(category?.imageUrl, "categories");

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl transition-all duration-300">
      
      {/* Category Section Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none group pb-4 border-b border-white/10"
      >
        <div className="flex items-center space-x-4">
          {/* Category Icon / Image Avatar */}
          {categoryImage ? (
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-blue-400/40 shadow-lg shrink-0 bg-slate-800">
              <img src={categoryImage} alt={categoryName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <Layers className="w-7 h-7" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">
                {categoryName}
              </h2>
            </div>
            <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
              <span className="text-blue-400 font-semibold">{packages.length} Diagnostic {packages.length === 1 ? "Package" : "Packages"}</span>
              <span>•</span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> NABL & CAP Accredited Labs
              </span>
            </p>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">
            {isExpanded ? "Collapse" : "Expand Section"}
          </span>
          <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable Package Cards Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 animate-fadeIn">
          {packages.map((pkg) => (
            <ClientPackageCard
              key={pkg.packageId || pkg.id}
              package={pkg}
              categoryName={categoryName}
            />
          ))}
        </div>
      )}

    </div>
  );
}
