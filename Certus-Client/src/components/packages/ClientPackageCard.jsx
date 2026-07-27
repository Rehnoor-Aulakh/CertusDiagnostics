import React, { useState } from "react";
import { getImageUrl } from "../../config/api";
import { Activity, ZoomIn, ArrowRight, FileText } from "lucide-react";
import PackageZoomModal from "./PackageZoomModal";
import BookingModal from "./BookingModal";

/**
 * ClientPackageCard Component
 * Reusable, patient-facing diagnostic package viewer card for Certus Diagnostics Client App.
 * Clean slate aesthetic matching the homepage (#2A3A5A theme), without AI-like gradients or NABL tags.
 * Automatically handles vertical (portrait) vs horizontal (landscape) flyer images with balanced buttons.
 */
export default function ClientPackageCard({ package: pkg, categoryName }) {
  const [isVertical, setIsVertical] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Modal States
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!pkg) return null;

  const resolvedImageUrl = getImageUrl(pkg.imageUrl, "packages");

  const priceFormatted = pkg.price
    ? `₹${Number(pkg.price).toLocaleString("en-IN")}`
    : "Price on Request";

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth * 1.1) {
      setIsVertical(true);
    } else {
      setIsVertical(false);
    }
    setImgLoaded(true);
  };

  const handleOpenZoom = () => {
    if (resolvedImageUrl && !imgError) {
      setZoomLevel(1);
      setShowZoomModal(true);
    }
  };

  const ZOOM_LEVELS = [1, 1.1, 1.25, 1.5];
  const zoomIn = () => setZoomLevel((prev) => {
    const next = ZOOM_LEVELS.find((z) => z > prev + 0.001);
    return next !== undefined ? next : prev;
  });
  const zoomOut = () => setZoomLevel((prev) => {
    const reversed = [...ZOOM_LEVELS].reverse();
    const next = reversed.find((z) => z < prev - 0.001);
    return next !== undefined ? next : prev;
  });
  const resetZoom = () => setZoomLevel(1);

  // Fallback placeholder when flyer is missing
  const renderPlaceholder = () => (
    <div className="w-full h-56 bg-slate-900/60 border border-slate-700/80 rounded-xl flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center mb-3">
        <Activity className="w-6 h-6" />
      </div>
      <span className="text-base font-bold text-white max-w-[200px] leading-snug">
        {pkg.name}
      </span>
      <span className="text-xs text-gray-400 mt-1">
        {pkg.numberOfTests || 0} Parameters
      </span>
    </div>
  );

  // Image Element with zoom hover overlay and natural blur-up animation
  const renderImageElement = (extraClassName = "") => (
    <div
      onClick={handleOpenZoom}
      className={`relative rounded-xl overflow-hidden bg-slate-900/80 border border-slate-700/80 shadow-md group/img cursor-pointer transition-all duration-500 hover:border-slate-500 flex items-center justify-center ${extraClassName}`}
    >
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 bg-slate-900/80 animate-pulse flex items-center justify-center text-gray-400 text-xs z-10 transition-opacity duration-500">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading flyer...</span>
          </div>
        </div>
      )}
      <img
        src={resolvedImageUrl}
        alt={pkg.name || "Package Flyer"}
        onLoad={handleImageLoad}
        onError={() => setImgError(true)}
        className={`w-full object-cover transition-all duration-300 ease-out group-hover/img:scale-105 ${
          !imgLoaded || imgError
            ? "opacity-0"
            : "opacity-100"
        } ${isVertical ? "h-[360px] md:h-full min-h-[300px]" : "h-auto max-h-[400px]"}`}
      />
      {/* Zoom indicator pill on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 z-20">
        <div className="bg-slate-900/90 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-lg transform scale-95 group-hover/img:scale-100 transition-transform duration-300">
          <ZoomIn className="w-4 h-4 text-blue-400" />
          <span>Click to Zoom Flyer</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 shadow-lg hover:border-slate-600 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
        
        {/* ================= VERTICAL LAYOUT (Portrait Flyer on Left) ================= */}
        {isVertical && resolvedImageUrl && !imgError ? (
          <div className="flex flex-col md:flex-row gap-6 items-stretch flex-1">
            {/* Left Side: Vertical Image */}
            <div className="w-full md:w-1/2 shrink-0 flex flex-col">
              {renderImageElement("h-full flex-1")}
            </div>

            {/* Right Side: Package Info & Action Controls */}
            <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
              <div>
                {/* Package Name */}
                <h3 className="text-2xl font-bold text-white hover:text-blue-300 transition-colors leading-snug mb-3">
                  {pkg.name}
                </h3>

                {/* Parameters Badge */}
                {pkg.numberOfTests > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-slate-700/70 border border-slate-600/60 px-3 py-1 rounded-lg text-xs font-semibold text-blue-300 mb-4">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span>{pkg.numberOfTests} Parameters Included</span>
                  </div>
                )}

                {/* Clean helper box explaining how to view parameters */}
                <div className="bg-slate-900/50 border border-slate-700/60 rounded-xl p-3.5 text-xs text-gray-300 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    Click the flyer image or use the View Flyer button below to read the complete parameter table and test inclusions.
                  </span>
                </div>
              </div>

              {/* Price & Buttons Section */}
              <div className="pt-4 border-t border-slate-700/80 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Package Offer Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-400 tracking-tight">
                      {priceFormatted}
                    </span>
                    <span className="text-xs text-gray-400">All inclusive</span>
                  </div>
                </div>

                {/* Clean, balanced buttons in a 2-column grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleOpenZoom}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-gray-200 hover:text-white font-semibold border border-slate-600 transition-colors text-sm flex items-center justify-center gap-1.5"
                    title="Zoom Flyer"
                  >
                    <ZoomIn className="w-4 h-4 shrink-0" />
                    <span>View Flyer</span>
                  </button>
                  
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow text-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= HORIZONTAL / STACKED LAYOUT (Landscape Flyer at Bottom) ================= */
          <div className="flex flex-col justify-between flex-1 space-y-6">
            
            {/* Top Section: Header & Parameters */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                <h3 className="text-2xl font-bold text-white hover:text-blue-300 transition-colors leading-snug">
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-2 shrink-0">
                  <span className="text-2xl md:text-3xl font-bold text-green-400 tracking-tight">
                    {priceFormatted}
                  </span>
                </div>
              </div>

              {pkg.numberOfTests > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-slate-700/70 border border-slate-600/60 px-3 py-1 rounded-lg text-xs font-semibold text-blue-300">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>{pkg.numberOfTests} Parameters Included</span>
                </div>
              )}
            </div>

            {/* Middle Section: Horizontal Flyer Image (or fallback) */}
            <div className="w-full">
              {resolvedImageUrl && !imgError ? (
                renderImageElement("w-full")
              ) : (
                renderPlaceholder()
              )}
            </div>

            {/* Bottom Section: Clean, balanced action bar */}
            <div className="pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-400">
                <span>Free home sample collection & digital reporting available.</span>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto min-w-[280px]">
                {resolvedImageUrl && !imgError ? (
                  <button
                    onClick={handleOpenZoom}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-gray-200 hover:text-white font-semibold border border-slate-600 transition-colors text-sm flex items-center justify-center gap-1.5"
                  >
                    <ZoomIn className="w-4 h-4 shrink-0" />
                    <span>View Flyer</span>
                  </button>
                ) : (
                  <div />
                )}
                
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow text-sm flex items-center justify-center gap-1.5 col-span-1"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Built-in Zoom Lightbox Modal */}
      <PackageZoomModal
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
        package={pkg}
        imageUrl={resolvedImageUrl}
        zoomLevel={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onBookNow={() => {
          setShowZoomModal(false);
          setShowBookingModal(true);
        }}
      />

      {/* Built-in Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        package={pkg}
      />
    </>
  );
}
