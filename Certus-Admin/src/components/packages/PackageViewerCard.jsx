import React, { useState } from "react";
import { getImageUrl } from "../../utils/api";

/**
 * Reusable Package Viewer Card Component
 * Professional, clean medical diagnostic UI style matching Dashboard and Patients pages.
 * Handles both vertical (portrait) and horizontal (landscape) flyer images.
 * Includes built-in Zoom Lightbox Modal for viewing flyer contents clearly.
 */
export default function PackageViewerCard({
  package: pkg,
  onEdit,
  onDelete,
  isEditMode = false,
  dragHandleProps = null
}) {
  const [isVertical, setIsVertical] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // Zoom Lightbox State
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const priceFormatted = pkg.price
    ? `₹${Number(pkg.price).toLocaleString("en-IN")}`
    : "Price N/A";

  const resolvedImageUrl = getImageUrl(pkg.imageUrl, "packages");

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

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  const resetZoom = () => setZoomLevel(1);

  // Fallback Placeholder when image is missing or errors out - clean medical gray box with black text
  const renderPlaceholderImage = () => (
    <div className="w-full h-48 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Diagnostic Package</span>
      <span className="text-sm font-bold text-gray-900 mt-1 max-w-[200px] truncate">{pkg.name || "Unnamed Package"}</span>
    </div>
  );

  // Render Image Box with object-contain so flyer contents are fully visible
  const renderImageBox = (isLeftColumn = false) => {
    if (!pkg.imageUrl || imgError) {
      return renderPlaceholderImage();
    }
    return (
      <div
        onClick={handleOpenZoom}
        className={`${
          isLeftColumn
            ? "w-full md:w-64 lg:w-72 min-h-[240px] border-b md:border-b-0 md:border-r border-gray-200"
            : "w-full h-64 border-t border-gray-200"
        } bg-gray-900 relative cursor-zoom-in overflow-hidden group flex items-center justify-center p-2`}
        title="Click to zoom flyer contents"
      >
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <img
          src={resolvedImageUrl}
          alt={pkg.name || "Diagnostic Package Brochure"}
          onLoad={handleImageLoad}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain max-h-[340px] group-hover:scale-105 transition-transform duration-300"
        />

        {/* Hover Zoom Indicator */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity z-20">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <span>Zoom</span>
        </div>

        {/* Display Order Badge */}
        {pkg.displayOrder !== undefined && pkg.displayOrder !== null && (
          <div className="absolute top-2 right-2 z-20">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-900/80 text-white border border-gray-700">
              #{pkg.displayOrder}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render Content Details Box
  const renderContentBox = () => (
    <div className="p-6 flex-1 flex flex-col justify-between bg-white">
      <div>
        {/* Category & Drag Handle Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-100">
            {pkg.categoryName || "Uncategorized"}
          </span>

          {/* Drag handle icon in edit mode */}
          {isEditMode && dragHandleProps && (
            <div
              {...dragHandleProps}
              className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-grab active:cursor-grabbing transition-colors flex items-center space-x-1"
              title="Drag to reorder package"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
              </svg>
              <span className="text-xs font-medium hidden sm:inline">Move</span>
            </div>
          )}
        </div>

        {/* Title - solid black text */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {pkg.name || "Unnamed Package"}
        </h3>

        {/* Parameters / Tests count */}
        {pkg.numberOfTests !== undefined && pkg.numberOfTests !== null ? (
          <div className="text-sm font-medium text-gray-700 flex items-center mb-4">
            <svg className="w-4 h-4 mr-1.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong className="font-bold text-gray-900">{pkg.numberOfTests}</strong> Tests & Parameters Included</span>
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-500 mb-4">Standard Diagnostic Package</div>
        )}
      </div>

      {/* Footer: Price & Admin Actions */}
      <div className="pt-4 border-t border-gray-200 flex items-center justify-between mt-4">
        <div>
          <span className="text-xs text-gray-500 block font-medium">Price</span>
          <span className="text-xl font-bold text-gray-900">
            {priceFormatted}
          </span>
        </div>

        {/* Admin Action Buttons (Edit / Delete) */}
        {isEditMode && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(pkg)}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium text-sm transition-colors"
                title="Edit Package Details"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(pkg.packageId)}
                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition-colors"
                title="Delete Package"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className={`group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/80 overflow-hidden flex ${
        isVertical ? "flex-col md:flex-row items-stretch" : "flex-col"
      } h-full transform hover:-translate-y-1`}>
        {isVertical ? (
          <>
            {renderImageBox(true)}
            {renderContentBox()}
          </>
        ) : (
          <>
            {renderContentBox()}
            {renderImageBox(false)}
          </>
        )}
      </div>

      {/* Zoom Lightbox Modal */}
      {showZoomModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 left-4 flex items-center justify-between text-white z-10">
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              <span className="font-bold text-sm">{pkg.name}</span>
              <span className="text-gray-400">|</span>
              <span className="text-xs text-blue-400 font-semibold">{zoomLevel * 100}% Zoom</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={zoomOut}
                disabled={zoomLevel <= 0.5}
                className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg border border-gray-700"
                title="Zoom Out"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={resetZoom}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold border border-gray-700"
                title="Reset Zoom"
              >
                100%
              </button>
              <button
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
                className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg border border-gray-700"
                title="Zoom In"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-700 mx-2" />
              <button
                onClick={() => setShowZoomModal(false)}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                title="Close Viewer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="w-full h-[85vh] flex items-center justify-center overflow-auto p-4 mt-12">
            <img
              src={resolvedImageUrl}
              alt={pkg.name}
              style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s ease-out" }}
              className="max-w-full max-h-full object-contain select-none cursor-grab active:cursor-grabbing rounded"
              draggable={false}
            />
          </div>

          <div className="absolute bottom-4 text-gray-300 text-xs font-medium bg-gray-900/80 px-4 py-1.5 rounded-lg border border-gray-700">
            Use Zoom controls above to inspect flyer tests and details
          </div>
        </div>
      )}
    </>
  );
}
