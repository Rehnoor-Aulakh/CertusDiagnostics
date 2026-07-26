import React, { useState } from "react";
import { getImageUrl } from "../../config/api";
import { Activity, ZoomIn, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Clock, FileText } from "lucide-react";
import PackageZoomModal from "./PackageZoomModal";
import BookingModal from "./BookingModal";

/**
 * ClientPackageCard Component
 * Reusable, patient-facing diagnostic package viewer card for Certus Diagnostics Client App.
 * Matches the premium glassmorphism aesthetics of HealthHistory and YourReports (rounded-3xl).
 * Automatically handles vertical (portrait) vs horizontal (landscape) flyer images.
 * Includes built-in Zoom Lightbox for flyer inspection and instant appointment booking modal.
 */
export default function ClientPackageCard({ package: pkg, categoryName = "Diagnostic Screening" }) {
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
    // If height is noticeably greater than width, classify as vertical/portrait
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

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  const resetZoom = () => setZoomLevel(1);

  // Fallback placeholder when flyer is missing
  const renderPlaceholder = () => (
    <div className="w-full h-56 bg-slate-800/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center mb-3 shadow-inner">
        <Activity className="w-7 h-7" />
      </div>
      <span className="text-xs uppercase font-extrabold text-blue-300 tracking-widest mb-1">
        {categoryName}
      </span>
      <span className="text-base font-bold text-white max-w-[200px] leading-snug">
        {pkg.name}
      </span>
      <span className="text-xs text-gray-400 mt-2">
        {pkg.numberOfTests || 0} Comprehensive Parameters
      </span>
    </div>
  );

  // Image Element with zoom hover overlay
  const renderImageElement = (extraClassName = "") => (
    <div
      onClick={handleOpenZoom}
      className={`relative rounded-2xl overflow-hidden bg-slate-800/50 border border-white/15 shadow-xl group/img cursor-pointer transition-all duration-300 hover:border-blue-400/60 hover:shadow-blue-500/10 ${extraClassName}`}
    >
      {!imgLoaded && !imgError && (
        <div className="w-full h-64 bg-slate-800/60 animate-pulse flex items-center justify-center text-gray-500 text-xs">
          Loading flyer...
        </div>
      )}
      <img
        src={resolvedImageUrl}
        alt={pkg.name || "Package Flyer"}
        onLoad={handleImageLoad}
        onError={() => setImgError(true)}
        className={`w-full object-cover transition-transform duration-500 group-hover/img:scale-105 ${
          !imgLoaded || imgError ? "hidden" : "block"
        } ${isVertical ? "h-[380px] md:h-full min-h-[320px]" : "h-auto max-h-[420px]"}`}
      />
      {/* Zoom indicator pill */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
        <div className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transform translate-y-2 group-hover/img:translate-y-0 transition-transform duration-300">
          <ZoomIn className="w-4 h-4" />
          <span>Click to Zoom Flyer & Read Details</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle top glowing accent on hover */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* ================= VERTICAL LAYOUT (Portrait Flyer on Left) ================= */}
        {isVertical && resolvedImageUrl && !imgError ? (
          <div className="flex flex-col md:flex-row gap-6 items-stretch flex-1">
            {/* Left Side: Vertical Image */}
            <div className="w-full md:w-5/12 lg:w-4/12 shrink-0 flex flex-col">
              {renderImageElement("h-full flex-1")}
            </div>

            {/* Right Side: Package Info & Action Controls */}
            <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>{categoryName}</span>
                  </span>
                  
                  {pkg.numberOfTests > 0 && (
                    <span className="bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      <span>{pkg.numberOfTests} Comprehensive Tests</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
                  {pkg.name}
                </h3>

                {/* Medical Highlights List */}
                <div className="space-y-2 pt-2 border-t border-white/10 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Includes Complete Blood Count, Sugar & Lipid Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>NABL & CAP Certified Accuracy Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Digital Report Delivered Within 24-48 Hours</span>
                  </div>
                </div>
              </div>

              {/* Price & Buttons Bar */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Package Offer Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                      {priceFormatted}
                    </span>
                    <span className="text-xs text-emerald-300/80 font-medium">All inclusive</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleOpenZoom}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all text-sm flex items-center gap-2"
                    title="Zoom Flyer"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span className="hidden sm:inline">View Flyer</span>
                  </button>
                  
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 transform hover:scale-105 transition-all text-sm flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= HORIZONTAL / STACKED LAYOUT (Landscape Flyer at Bottom) ================= */
          <div className="flex flex-col justify-between flex-1 space-y-6">
            
            {/* Top Section: Header & Badges */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>{categoryName}</span>
                  </span>
                  
                  {pkg.numberOfTests > 0 && (
                    <span className="bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      <span>{pkg.numberOfTests} Tests Included</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NABL Accredited</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-2 shrink-0">
                  <span className="text-2xl md:text-3xl font-extrabold text-emerald-400 tracking-tight">
                    {priceFormatted}
                  </span>
                </div>
              </div>

              {/* Quick Summary Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Home Collection</span>
                </span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Reports in 24 Hours</span>
                </span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Doctor Consultation Support</span>
                </span>
              </div>
            </div>

            {/* Bottom Section: Horizontal Flyer Image (or fallback) */}
            <div className="w-full">
              {resolvedImageUrl && !imgError ? (
                renderImageElement("w-full mt-2")
              ) : (
                renderPlaceholder()
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-400">
                <span>Need customized screening? Contact our diagnostic experts 24/7.</span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                {resolvedImageUrl && !imgError && (
                  <button
                    onClick={handleOpenZoom}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all text-sm flex items-center gap-2"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span>Zoom Flyer</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 transform hover:scale-105 transition-all text-sm flex items-center justify-center gap-2 min-w-[140px]"
                >
                  <span>Book Package</span>
                  <ArrowRight className="w-4 h-4" />
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
