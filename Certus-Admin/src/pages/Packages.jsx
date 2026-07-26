import { useState, useEffect } from "react";
import API_ENDPOINTS from "../utils/api";
import PackageCategorySection from "../components/packages/PackageCategorySection";

export default function Packages() {
    const [packageData, setPackageData] = useState([]);
    const [allCategoriesList, setAllCategoriesList] = useState([]);
    const [allPackagesList, setAllPackagesList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2 Modes: View Mode (default) and Edit Mode
    const [isEditMode, setIsEditMode] = useState(false);

    // Modals State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null); // null = new
    const [catForm, setCatForm] = useState({ name: "", imageUrl: "", status: true });

    const [showPackageModal, setShowPackageModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null); // null = new
    const [pkgForm, setPkgForm] = useState({
        name: "",
        categoryId: "",
        price: "",
        numberOfTests: "",
        imageUrl: "",
        statusAvailable: true,
        displayOrder: ""
    });

    const [submitting, setSubmitting] = useState(false);

    const getHeaders = () => {
        const token = JSON.parse(localStorage.getItem("adminUser"))?.token;
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const headers = getHeaders();
            const [categoryResponse, packageResponse] = await Promise.all([
                fetch(API_ENDPOINTS.packageCategories, { headers }),
                fetch(API_ENDPOINTS.packages, { headers }),
            ]);
            if (!categoryResponse.ok || !packageResponse.ok) {
                throw new Error("Failed to load package data from backend.");
            }
            const categoryJson = await categoryResponse.json();
            const packageJson = await packageResponse.json();

            const categories = categoryJson.data || [];
            const packages = packageJson.data || [];

            setAllCategoriesList(categories);
            setAllPackagesList(packages);

            const groupedCategories = categories.map((category) => ({
                ...category,
                packages: packages
                    .filter((pkg) => pkg.categoryId === category.categoryId)
                    .map((pkg) => ({ ...pkg, categoryName: category.name }))
            }));

            const uncategorized = packages
                .filter((pkg) => pkg.categoryId == null || pkg.categoryId <= 0)
                .map((pkg) => ({ ...pkg, categoryName: "Uncategorized" }));

            if (uncategorized.length > 0) {
                groupedCategories.push({
                    categoryId: null,
                    name: "Uncategorized",
                    packages: uncategorized
                });
            }

            setPackageData(groupedCategories);
        } catch (err) {
            console.error("Error fetching packages:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ==========================================
    // DRAG AND DROP REORDERING HANDLERS
    // ==========================================

    // 1. Category Reorder
    const handleCategoryDrop = async (sourceCategoryId, targetCategoryId) => {
        if (sourceCategoryId === targetCategoryId || sourceCategoryId === null || targetCategoryId === null) return;

        // Find indices in packageData (excluding Uncategorized)
        const validCategories = packageData.filter((c) => c.categoryId !== null);
        const sourceIndex = validCategories.findIndex((c) => c.categoryId === sourceCategoryId);
        const targetIndex = validCategories.findIndex((c) => c.categoryId === targetCategoryId);

        if (sourceIndex === -1 || targetIndex === -1) return;

        // Reorder array locally for instant UI response
        const reordered = [...validCategories];
        const [movedItem] = reordered.splice(sourceIndex, 1);
        reordered.splice(targetIndex, 0, movedItem);

        // Re-assign displayOrder (0, 1, 2...) -> exactly what the backend expects
        const orderPayload = reordered.map((cat, index) => ({
            categoryId: cat.categoryId,
            displayOrder: index
        }));

        // Update local state immediately
        const uncategorizedObj = packageData.find((c) => c.categoryId === null);
        const newGrouped = uncategorizedObj ? [...reordered, uncategorizedObj] : reordered;
        setPackageData(newGrouped);

        // Call Backend API
        try {
            const res = await fetch(API_ENDPOINTS.reorderCategories, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(orderPayload)
            });
            if (!res.ok) throw new Error("Failed to save category order");
        } catch (err) {
            console.error("Reorder category error:", err);
            alert("Failed to save category order. Refreshing data.");
            fetchData();
        }
    };

    // 2. Package Reorder & Category Movement
    const handlePackageDrop = async (sourcePackageId, targetCategoryId, targetPackageId = null) => {
        const sourcePkg = allPackagesList.find((p) => p.packageId === sourcePackageId);
        if (!sourcePkg) return;

        const oldCategoryId = sourcePkg.categoryId || null;
        const newCategoryId = targetCategoryId || null;

        // If moved to a different category, update via PATCH first
        if (oldCategoryId !== newCategoryId) {
            try {
                const patchPayload = {
                    categoryId: newCategoryId === null ? -1 : newCategoryId
                };
                await fetch(`${API_ENDPOINTS.packages}/${sourcePackageId}`, {
                    method: "PATCH",
                    headers: getHeaders(),
                    body: JSON.stringify(patchPayload)
                });
            } catch (err) {
                console.error("Error changing package category:", err);
            }
        }

        // Now reorder packages within the target category
        const targetCategoryObj = packageData.find((c) => c.categoryId === targetCategoryId);
        if (!targetCategoryObj) {
            fetchData();
            return;
        }

        let categoryPackages = [...(targetCategoryObj.packages || [])];

        // If moving from another category, add sourcePkg into this category array if not present
        if (oldCategoryId !== newCategoryId) {
            if (!categoryPackages.some((p) => p.packageId === sourcePackageId)) {
                categoryPackages.push({
                    ...sourcePkg,
                    categoryId: newCategoryId,
                    categoryName: targetCategoryObj.name
                });
            }
        }

        const sourceIdx = categoryPackages.findIndex((p) => p.packageId === sourcePackageId);
        if (sourceIdx !== -1 && targetPackageId) {
            const targetIdx = categoryPackages.findIndex((p) => p.packageId === targetPackageId);
            if (targetIdx !== -1 && sourceIdx !== targetIdx) {
                const [moved] = categoryPackages.splice(sourceIdx, 1);
                categoryPackages.splice(targetIdx, 0, moved);
            }
        }

        // Assign sequential displayOrder
        const orderPayload = categoryPackages.map((pkg, index) => ({
            packageId: pkg.packageId,
            displayOrder: index
        }));

        // Optimistic refresh
        fetchData();

        // Call Backend Reorder API
        try {
            const res = await fetch(API_ENDPOINTS.reorderPackages, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(orderPayload)
            });
            if (!res.ok) throw new Error("Failed to reorder packages");
        } catch (err) {
            console.error("Reorder package error:", err);
            fetchData();
        }
    };

    // ==========================================
    // MODAL HANDLERS (CATEGORY & PACKAGE CRUD)
    // ==========================================

    // Category Modal
    const openNewCategoryModal = () => {
        setEditingCategory(null);
        setCatForm({ name: "", imageUrl: "", status: true });
        setShowCategoryModal(true);
    };

    const openEditCategoryModal = (cat) => {
        setEditingCategory(cat);
        setCatForm({
            name: cat.name || "",
            imageUrl: cat.imageUrl || "",
            status: cat.statusAvailable !== undefined ? cat.statusAvailable : true
        });
        setShowCategoryModal(true);
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingCategory
                ? `${API_ENDPOINTS.packageCategories}/${editingCategory.categoryId}`
                : API_ENDPOINTS.packageCategories;
            const method = editingCategory ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(catForm)
            });
            if (!res.ok) throw new Error("Failed to save category");
            setShowCategoryModal(false);
            fetchData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            const res = await fetch(`${API_ENDPOINTS.packageCategories}/${categoryId}`, {
                method: "DELETE",
                headers: getHeaders()
            });
            if (!res.ok) throw new Error("Failed to delete category");
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    // Package Modal
    const openNewPackageModal = (presetCategoryId = "") => {
        setEditingPackage(null);
        setPkgForm({
            name: "",
            categoryId: presetCategoryId !== null && presetCategoryId !== undefined ? String(presetCategoryId) : "",
            price: "",
            numberOfTests: "",
            imageUrl: "",
            statusAvailable: true,
            displayOrder: ""
        });
        setShowPackageModal(true);
    };

    const openEditPackageModal = (pkg) => {
        setEditingPackage(pkg);
        setPkgForm({
            name: pkg.name || "",
            categoryId: pkg.categoryId !== null && pkg.categoryId !== undefined ? String(pkg.categoryId) : "",
            price: pkg.price !== null && pkg.price !== undefined ? String(pkg.price) : "",
            numberOfTests: pkg.numberOfTests !== null && pkg.numberOfTests !== undefined ? String(pkg.numberOfTests) : "",
            imageUrl: pkg.imageUrl || "",
            statusAvailable: pkg.statusAvailable !== undefined ? pkg.statusAvailable : true,
            displayOrder: pkg.displayOrder !== null && pkg.displayOrder !== undefined ? String(pkg.displayOrder) : ""
        });
        setShowPackageModal(true);
    };

    const handlePackageSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingPackage
                ? `${API_ENDPOINTS.packages}/${editingPackage.packageId}`
                : API_ENDPOINTS.packages;
            const method = editingPackage ? "PATCH" : "POST";

            const payload = {
                name: pkgForm.name,
                categoryId: pkgForm.categoryId === "" || pkgForm.categoryId === "null" ? -1 : Number(pkgForm.categoryId),
                price: pkgForm.price !== "" ? Number(pkgForm.price) : null,
                numberOfTests: pkgForm.numberOfTests !== "" ? Number(pkgForm.numberOfTests) : null,
                imageUrl: pkgForm.imageUrl,
                statusAvailable: pkgForm.statusAvailable,
                displayOrder: pkgForm.displayOrder !== "" ? Number(pkgForm.displayOrder) : null
            };

            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to save package details");
            setShowPackageModal(false);
            fetchData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePackage = async (packageId) => {
        if (!window.confirm("Are you sure you want to delete this package?")) return;
        try {
            const res = await fetch(`${API_ENDPOINTS.packages}/${packageId}`, {
                method: "DELETE",
                headers: getHeaders()
            });
            if (!res.ok) throw new Error("Failed to delete package");
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent shadow-lg"></div>
                <p className="text-gray-500 font-semibold text-sm tracking-wide animate-pulse">Loading Diagnostic Packages...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 border-2 border-red-200 rounded-3xl text-red-700 max-w-lg mx-auto text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600 font-black text-xl">!</div>
                <p className="font-extrabold text-lg">Error Loading Packages</p>
                <p className="text-sm mt-1 text-red-600">{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-6 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    Retry Fetching
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header & Mode Toggle Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 transition-all">
                <div>
                    <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Diagnostic Packages
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isEditMode ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                            {isEditMode ? "Edit Mode Active" : "View Mode"}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                        {isEditMode
                            ? "Reorder categories or packages by dragging. Click Edit on any item to update details and pricing."
                            : "Explore diagnostic healthcare packages and promotional brochures."}
                    </p>
                </div>

                {/* Action Controls */}
                <div className="flex items-center flex-wrap gap-3">
                    {isEditMode && (
                        <>
                            <button
                                onClick={openNewCategoryModal}
                                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1.5 shadow-sm"
                            >
                                + Add Category
                            </button>

                            <button
                                onClick={() => openNewPackageModal("")}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1.5 shadow-sm"
                            >
                                + Add Package
                            </button>
                        </>
                    )}

                    {/* Switch Mode Button */}
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                        <span>{isEditMode ? "Done Editing (View Mode)" : "Switch to Edit Mode"}</span>
                    </button>
                </div>
            </div>

            {/* Categories & Packages List */}
            {packageData.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900">No Packages Found</h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                        Get started by switching to Edit Mode and adding your first diagnostic package or category.
                    </p>
                    {isEditMode && (
                        <div className="mt-6 flex justify-center space-x-3">
                            <button
                                onClick={openNewCategoryModal}
                                className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors shadow-sm"
                            >
                                + Add Category
                            </button>
                            <button
                                onClick={() => openNewPackageModal("")}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow"
                            >
                                + Add Package
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    {packageData.map((category) => (
                        <PackageCategorySection
                            key={category.categoryId || "uncategorized"}
                            category={category}
                            allCategories={allCategoriesList}
                            isEditMode={isEditMode}
                            onEditCategory={openEditCategoryModal}
                            onDeleteCategory={handleDeleteCategory}
                            onAddPackageToCategory={openNewPackageModal}
                            onEditPackage={openEditPackageModal}
                            onDeletePackage={handleDeletePackage}
                            onCategoryDrop={handleCategoryDrop}
                            onPackageDrop={handlePackageDrop}
                        />
                    ))}
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL 1: ADD / EDIT CATEGORY */}
            {/* ========================================== */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 md:p-8 border border-gray-200 overflow-hidden relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingCategory ? "Edit Category Details" : "Add New Category"}
                        </h3>

                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Hormonal Imbalance, Full Body Checkup"
                                    value={catForm.name}
                                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                    Image URL / Filename (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. category_icon.png or https://..."
                                    value={catForm.imageUrl}
                                    onChange={(e) => setCatForm({ ...catForm, imageUrl: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave blank if no image is needed.</p>
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="catStatus"
                                    checked={catForm.status}
                                    onChange={(e) => setCatForm({ ...catForm, status: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="catStatus" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Category is Active & Available
                                </label>
                            </div>

                            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
                                >
                                    {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL 2: ADD / EDIT PACKAGE */}
            {/* ========================================== */}
            {showPackageModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 md:p-8 border border-gray-200 overflow-auto max-h-[90vh] relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingPackage ? "Edit Package Details" : "Add New Diagnostic Package"}
                        </h3>

                        <form onSubmit={handlePackageSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                    Package Title / Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Womens Hairfall Screening Advanced"
                                    value={pkgForm.name}
                                    onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={pkgForm.categoryId}
                                        onChange={(e) => setPkgForm({ ...pkgForm, categoryId: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 outline-none bg-white"
                                    >
                                        <option value="">-- Uncategorized --</option>
                                        {allCategoriesList.map((cat) => (
                                            <option key={cat.categoryId} value={cat.categoryId}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="3299"
                                        value={pkgForm.price}
                                        onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                        Number of Tests Included
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="51"
                                        value={pkgForm.numberOfTests}
                                        onChange={(e) => setPkgForm({ ...pkgForm, numberOfTests: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                        Display Order #
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Auto (0, 1, 2...)"
                                        value={pkgForm.displayOrder}
                                        onChange={(e) => setPkgForm({ ...pkgForm, displayOrder: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                                    Flyer Brochure Image URL / Filename
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Hairfall_Package.jpeg"
                                    value={pkgForm.imageUrl}
                                    onChange={(e) => setPkgForm({ ...pkgForm, imageUrl: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Flyer image stored in uploads/packages folder or full URL.</p>
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="pkgStatus"
                                    checked={pkgForm.statusAvailable}
                                    onChange={(e) => setPkgForm({ ...pkgForm, statusAvailable: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="pkgStatus" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Package is Active & Available for Booking
                                </label>
                            </div>

                            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowPackageModal(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
                                >
                                    {submitting ? "Saving..." : editingPackage ? "Save Changes" : "Create Package"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}