import React from "react";
import { getImageUrl } from "../../utils/api";

export default function PackageCard({ package: pkg, onEdit, onDelete }) {
  const priceFormatted = pkg.price
    ? `₹${Number(pkg.price).toLocaleString("en-IN")}`
    : "Price N/A";

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
      {/* Top Image Banner or Gradient Placeholder */}
      <div className="relative h-48 w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden flex items-center justify-center">
        {/* Default icon & text always present underneath */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center z-0">
          <svg
            className="w-12 h-12 mb-2 opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          <span className="text-xs uppercase tracking-wider font-semibold opacity-75">
            Diagnostic Package
          </span>
        </div>

        {/* Image overlaid on top with onError fallback */}
        {pkg.imageUrl && (
          <img
            src={getImageUrl(pkg.imageUrl, "packages")}
            alt={pkg.name || "Package image"}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-10"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-md text-gray-800 shadow-sm border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
            {pkg.categoryName || "Uncategorized"}
          </span>
        </div>

        {/* Display Order badge overlay */}
        {pkg.displayOrder !== undefined && pkg.displayOrder !== null && (
          <div className="absolute top-4 right-4 z-20">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-md text-white">
              #{pkg.displayOrder}
            </span>
          </div>
        )}
      </div>


      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {pkg.name || "Unnamed Package"}
          </h3>

          <div className="mt-3 flex items-center text-sm text-gray-500 space-x-4">
            {pkg.numberOfTests !== undefined && pkg.numberOfTests !== null && (
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-gray-700">
                  {pkg.numberOfTests} Tests Included
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Price and Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Price</span>
            <span className="text-2xl font-extrabold text-gray-900">
              {priceFormatted}
            </span>
          </div>

          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(pkg)}
                className="p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Edit Package"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(pkg.packageId)}
                className="p-2 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Package"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
