import React, { useState } from "react";
import PackageViewerCard from "./PackageViewerCard";

/**
 * Package Category Section Component
 * Displays a single Category block with its packages.
 * Clean, professional medical diagnostic UI style matching Dashboard and Patients pages.
 * Supports HTML5 Drag-and-Drop for both Category reordering and Package reordering in Edit Mode.
 */
export default function PackageCategorySection({
  category,
  allCategories,
  isEditMode,
  onEditCategory,
  onDeleteCategory,
  onAddPackageToCategory,
  onEditPackage,
  onDeletePackage,
  onCategoryDragStart,
  onCategoryDragOver,
  onCategoryDrop,
  onPackageDragStart,
  onPackageDragOver,
  onPackageDrop
}) {
  const [isDragOverCategory, setIsDragOverCategory] = useState(false);

  const handleDragOver = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCategory(true);
    if (onCategoryDragOver) onCategoryDragOver(e, category);
  };

  const handleDragLeave = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    setIsDragOverCategory(false);
  };

  const handleDrop = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCategory(false);

    const dragType = e.dataTransfer.getData("dragType");
    if (dragType === "PACKAGE") {
      const packageId = Number(e.dataTransfer.getData("packageId"));
      if (onPackageDrop) onPackageDrop(packageId, category.categoryId);
    } else if (dragType === "CATEGORY") {
      const sourceCategoryId = e.dataTransfer.getData("categoryId");
      const parsedSourceId = sourceCategoryId === "null" ? null : Number(sourceCategoryId);
      if (onCategoryDrop) onCategoryDrop(parsedSourceId, category.categoryId);
    }
  };

  const handleCategoryDragStart = (e) => {
    if (!isEditMode) return;
    e.dataTransfer.setData("dragType", "CATEGORY");
    e.dataTransfer.setData("categoryId", String(category.categoryId));
    if (onCategoryDragStart) onCategoryDragStart(e, category);
  };

  const handlePackageDragStartLocal = (e, pkg) => {
    if (!isEditMode) return;
    e.stopPropagation();
    e.dataTransfer.setData("dragType", "PACKAGE");
    e.dataTransfer.setData("packageId", String(pkg.packageId));
    e.dataTransfer.setData("sourceCategoryId", String(category.categoryId));
    if (onPackageDragStart) onPackageDragStart(e, pkg);
  };

  const handlePackageDropOnCard = (e, targetPkg) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    const dragType = e.dataTransfer.getData("dragType");
    if (dragType === "PACKAGE") {
      const sourcePackageId = Number(e.dataTransfer.getData("packageId"));
      if (onPackageDrop) onPackageDrop(sourcePackageId, category.categoryId, targetPkg.packageId);
    }
  };

  return (
    <div
      draggable={isEditMode && category.categoryId !== null}
      onDragStart={handleCategoryDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-all duration-300 rounded-3xl p-6 md:p-8 bg-white border ${
        isDragOverCategory
          ? "border-blue-500 bg-blue-50/20 ring-4 ring-blue-500/20 scale-[1.01]"
          : isEditMode
          ? "border-dashed border-2 border-blue-400 shadow-sm"
          : "border-gray-100/80 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Category Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          {/* Drag Handle Icon for Category (Edit Mode) */}
          {isEditMode && category.categoryId !== null && (
            <div
              className="p-1.5 rounded bg-gray-100 text-gray-600 cursor-grab active:cursor-grabbing hover:bg-gray-200 transition-colors"
              title="Drag to reorder category"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-900">
              {category.name}
            </h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full">
              {category.packages?.length || 0} {category.packages?.length === 1 ? "Package" : "Packages"}
            </span>
          </div>
        </div>

        {/* Edit Mode Category Actions */}
        {isEditMode && (
          <div className="flex items-center flex-wrap gap-2 sm:self-center">
            <button
              onClick={() => onAddPackageToCategory && onAddPackageToCategory(category.categoryId)}
              className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Package</span>
            </button>

            {category.categoryId !== null && (
              <>
                <button
                  onClick={() => onEditCategory && onEditCategory(category)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                  title="Edit Category Details"
                >
                  Edit Category
                </button>

                <button
                  onClick={() => onDeleteCategory && onDeleteCategory(category.categoryId)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                  title="Delete Category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Packages Grid */}
      {category.packages && category.packages.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {category.packages.map((pkg) => (
            <div
              key={pkg.packageId}
              draggable={isEditMode}
              onDragStart={(e) => handlePackageDragStartLocal(e, pkg)}
              onDragOver={(e) => {
                if (isEditMode) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onDrop={(e) => handlePackageDropOnCard(e, pkg)}
              className={isEditMode ? "cursor-move rounded-lg transition-all" : ""}
            >
              <PackageViewerCard
                package={pkg}
                isEditMode={isEditMode}
                onEdit={onEditPackage}
                onDelete={onDeletePackage}
                dragHandleProps={
                  isEditMode
                    ? {
                        onMouseDown: (e) => e.stopPropagation(),
                        title: "Drag to reorder"
                      }
                    : null
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm font-medium">
            No diagnostic packages in this category yet.
          </p>
          {isEditMode && (
            <button
              onClick={() => onAddPackageToCategory && onAddPackageToCategory(category.categoryId)}
              className="mt-3 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs transition-colors"
            >
              + Add First Package Here
            </button>
          )}
        </div>
      )}
    </div>
  );
}
