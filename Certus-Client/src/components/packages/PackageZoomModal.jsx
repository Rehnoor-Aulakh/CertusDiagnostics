import React, { useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw, X, Activity, Calendar, ShieldCheck } from "lucide-react";

/**
 * PackageZoomModal Component
 * Full-screen lightbox modal for viewing diagnostic package flyer images in high detail.
 * Allows patients to zoom in, zoom out, reset zoom, and read all parameters and pricing clearly.
 */
export default function PackageZoomModal({
  isOpen,
  onClose,
  package: pkg,
  imageUrl,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onBookNow
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pkg) return null;

  const priceFormatted = pkg.price
    ? `₹${Number(pkg.price).toLocaleString("en-IN")}`
    : "Price on Request";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6 animate-fadeIn">
      {/* Lightbox Container */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-lg md:text-xl font-bold text-white truncate">
                {pkg.name || "Diagnostic Package"}
              </h3>
              <p className="text-xs text-blue-300 font-medium flex items-center gap-2">
                <span>{pkg.numberOfTests || 0} Tests Included</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{priceFormatted}</span>
              </p>
            </div>
          </div>

          {/* Zoom Controls & Close Button */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center bg-slate-700/60 border border-white/10 rounded-xl p-1 space-x-1">
              <button
                onClick={onZoomOut}
                disabled={zoomLevel <= 0.5}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-600/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-bold text-gray-200 px-2 min-w-[3.5rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                onClick={onZoomIn}
                disabled={zoomLevel >= 3}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-600/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={onResetZoom}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-600/60 transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors ml-2"
              title="Close Modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Scroll / Pan Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-black/40 relative min-h-[50vh]">
          {imageUrl ? (
            <div className="transition-transform duration-200 ease-out origin-center flex items-center justify-center">
              <img
                src={imageUrl}
                alt={pkg.name || "Package Flyer"}
                style={{
                  transform: `scale(${zoomLevel})`,
                  maxHeight: zoomLevel === 1 ? "75vh" : "none",
                  maxWidth: zoomLevel === 1 ? "100%" : "none",
                }}
                className="rounded-2xl shadow-2xl border border-white/15 object-contain transition-all duration-200"
              />
            </div>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center mx-auto mb-4 text-gray-500">
                <Activity className="w-8 h-8" />
              </div>
              <p className="text-gray-400 font-medium text-base">
                Flyer preview is not available for this package.
              </p>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="px-6 py-4 bg-slate-800/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% NABL Certified Quality</span>
            </div>
            <span className="hidden md:inline text-gray-600">•</span>
            <div className="hidden md:flex items-center space-x-1.5 text-blue-300 font-medium">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Free Home Sample Collection Available</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-semibold border border-white/15 transition-all text-sm"
            >
              Close Preview
            </button>
            <button
              onClick={() => {
                onClose();
                if (onBookNow) onBookNow(pkg);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>Book This Package</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-extrabold">{priceFormatted}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
