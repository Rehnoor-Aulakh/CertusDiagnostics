import React, { useState } from "react";
import { getImageUrl } from "../../config/api";
import ClientPackageCard from "./ClientPackageCard";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";

/**
 * ClientCategorySection Component
 * Renders a diagnostic package category section in the Certus Client Application.
 * Matches the clean homepage slate aesthetic and removes unnecessary accreditation tags.
 */
export default function ClientCategorySection({ category, packages = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!packages || packages.length === 0) return null;

  const categoryName = category?.name || "General Screenings & Packages";
  const categoryImage = getImageUrl(category?.imageUrl, "package-category") || getImageUrl(category?.imageUrl, "package-categories") || getImageUrl(category?.imageUrl, "categories");

  return (
    <div className="bg-slate-800/60 rounded-2xl p-6 md:p-8 border border-slate-700/80 shadow-lg transition-all duration-300">
      
      {/* Compact Horizontal Category Banner Image - Shrunk to Fit Cleanly Without Borders */}
      {categoryImage && (
        <div className="flex justify-start mb-5">
          <img 
            src={categoryImage} 
            alt={categoryName} 
            className="max-h-36 sm:max-h-44 md:max-h-52 w-auto object-contain rounded-2xl shadow-lg border border-slate-700/80 bg-transparent" 
          />
        </div>
      )}

      {/* Category Section Header (Name hidden when image is available) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none group pb-4 border-b border-slate-700/80"
      >
        <div className="flex items-center space-x-4">
          {/* Category Icon (only shown when no image exists) */}
          {!categoryImage && (
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-700 text-blue-400 flex items-center justify-center shadow shrink-0 border border-slate-600">
              <Layers className="w-6 h-6 md:w-7 md:h-7" />
            </div>
          )}

          <div>
            {!categoryImage && (
              <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                {categoryName}
              </h2>
            )}
            <p className="text-sm text-gray-400 mt-1">
              {packages.length} Diagnostic {packages.length === 1 ? "Package" : "Packages"} Available
            </p>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
          <div className="w-9 h-9 rounded-lg bg-slate-700/80 group-hover:bg-slate-700 text-gray-300 group-hover:text-white flex items-center justify-center transition-colors border border-slate-600">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable Package Cards Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-6">
          {packages.map((pkg) => (
            <ClientPackageCard
              key={pkg.packageId || pkg.id}
              package={pkg}
              categoryName={category?.name}
            />
          ))}
        </div>
      )}

    </div>
  );
}
