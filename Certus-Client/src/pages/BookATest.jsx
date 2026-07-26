import React, { useState, useEffect, useMemo, useCallback } from "react";
import { API_BASE_URL } from "../config/api";
import ClientCategorySection from "../components/packages/ClientCategorySection";
import ClientPackageCard from "../components/packages/ClientPackageCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, RefreshCw, AlertTriangle, Filter, ArrowUpDown, X } from "lucide-react";

/**
 * BookATest Page Component
 * Patient-facing diagnostic test and package catalog for Certus Diagnostics Client App.
 * Matches the clean, professional homepage aesthetic (#2A3A5A background, slate cards, clean typography).
 * Fetches categories and packages dynamically, enabling live search, category filtering, and sorting.
 */
export default function BookATest() {
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL"); // "ALL", or categoryId, or "UNCATEGORIZED"
  const [sortBy, setSortBy] = useState("default"); // "default" | "price_asc" | "price_desc" | "tests_desc"

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Categories
      let catsData = { success: false, data: [] };
      try {
        const res = await fetch(`${API_BASE_URL}/viewer/package-categories`);
        if (res.ok) catsData = await res.json();
      } catch (e) {
        console.warn("Viewer categories fetch failed, trying fallback...", e);
      }
      if (!catsData.success) {
        try {
          const res = await fetch(`${API_BASE_URL}/package-categories`);
          if (res.ok) catsData = await res.json();
        } catch (e) {
          console.warn("Fallback categories fetch failed", e);
        }
      }

      // 2. Fetch Packages
      let pkgsData = { success: false, data: [] };
      try {
        const res = await fetch(`${API_BASE_URL}/viewer/packages`);
        if (res.ok) pkgsData = await res.json();
      } catch (e) {
        console.warn("Viewer packages fetch failed, trying fallback...", e);
      }
      if (!pkgsData.success) {
        try {
          const res = await fetch(`${API_BASE_URL}/packages`);
          if (res.ok) pkgsData = await res.json();
        } catch (e) {
          console.warn("Fallback packages fetch failed", e);
        }
      }

      if (catsData.success || pkgsData.success) {
        const fetchedCats = catsData.data || [];
        const fetchedPkgs = pkgsData.data || [];
        
        fetchedCats.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        fetchedPkgs.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        setCategories(fetchedCats);
        setPackages(fetchedPkgs);
      } else {
        throw new Error("Unable to load diagnostic packages at the moment.");
      }
    } catch (err) {
      console.error("Error loading book a test data:", err);
      setError(err.message || "Failed to load diagnostic packages. Please check your network and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Map of categoryId -> Category Object
  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      map.set(String(cat.categoryId || cat.id), cat);
    });
    return map;
  }, [categories]);

  // Filtered and Sorted Packages
  const filteredPackages = useMemo(() => {
    let result = [...packages];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((pkg) => {
        const nameMatch = pkg.name && pkg.name.toLowerCase().includes(q);
        const catObj = pkg.categoryId ? categoryMap.get(String(pkg.categoryId)) : null;
        const catMatch = catObj && catObj.name && catObj.name.toLowerCase().includes(q);
        return nameMatch || catMatch;
      });
    }

    // 2. Category Filter
    if (selectedCategory !== "ALL") {
      if (selectedCategory === "UNCATEGORIZED") {
        result = result.filter((pkg) => !pkg.categoryId || !categoryMap.has(String(pkg.categoryId)));
      } else {
        result = result.filter((pkg) => String(pkg.categoryId) === String(selectedCategory));
      }
    }

    // 3. Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "tests_desc") {
      result.sort((a, b) => (Number(b.numberOfTests) || 0) - (Number(a.numberOfTests) || 0));
    } else {
      result.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }

    return result;
  }, [packages, searchQuery, selectedCategory, categoryMap, sortBy]);

  // Group packages by category for the "ALL" view
  const groupedSections = useMemo(() => {
    if (selectedCategory !== "ALL") return null;

    const sections = [];
    const usedPackageIds = new Set();

    categories.forEach((cat) => {
      const catIdStr = String(cat.categoryId || cat.id);
      const pkgsInCat = filteredPackages.filter((pkg) => String(pkg.categoryId) === catIdStr);
      if (pkgsInCat.length > 0) {
        sections.push({
          key: `cat-${catIdStr}`,
          category: cat,
          packages: pkgsInCat
        });
        pkgsInCat.forEach((p) => usedPackageIds.add(p.packageId || p.id));
      }
    });

    const uncategorizedPkgs = filteredPackages.filter((pkg) => !usedPackageIds.has(pkg.packageId || pkg.id));
    if (uncategorizedPkgs.length > 0) {
      sections.push({
        key: "cat-uncategorized",
        category: { name: "General Screenings & Specialized Tests" },
        packages: uncategorizedPkgs
      });
    }

    return sections;
  }, [categories, filteredPackages, selectedCategory]);

  return (
    <div className="min-h-screen py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Hero Header Section - Clean Homepage Aesthetic */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Book Diagnostic Tests & Packages
          </h1>
          <p className="text-base md:text-lg text-gray-300">
            Explore our comprehensive range of health checkup packages and screenings. Select a package to view detailed test parameters or schedule an appointment instantly.
          </p>
        </div>

        {/* Search & Filter Bar - Clean Slate Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 mb-10 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by package name or category (e.g. Hairfall, Diabetes, Full Body)..."
                className="w-full bg-slate-900/90 text-white pl-12 pr-10 py-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none placeholder-gray-500 text-sm md:text-base transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="w-full md:w-auto flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer py-0.5"
              >
                <option value="default" className="bg-slate-900 text-white">Default Order</option>
                <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="tests_desc" className="bg-slate-900 text-white">Most Tests Included</option>
              </select>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 shrink-0 ${
                selectedCategory === "ALL"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-700/60 hover:bg-slate-700 text-gray-300"
              }`}
            >
              <span>All Packages ({packages.length})</span>
            </button>

            {categories.map((cat) => {
              const catIdStr = String(cat.categoryId || cat.id);
              const count = packages.filter((p) => String(p.categoryId) === catIdStr).length;
              if (count === 0 && selectedCategory !== catIdStr) return null;

              return (
                <button
                  key={catIdStr}
                  onClick={() => setSelectedCategory(catIdStr)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 shrink-0 ${
                    selectedCategory === catIdStr
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-700/60 hover:bg-slate-700 text-gray-300"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === catIdStr ? "bg-white/20 text-white" : "bg-slate-800 text-gray-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {packages.some((p) => !p.categoryId || !categoryMap.has(String(p.categoryId))) && (
              <button
                onClick={() => setSelectedCategory("UNCATEGORIZED")}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 shrink-0 ${
                  selectedCategory === "UNCATEGORIZED"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-700/60 hover:bg-slate-700 text-gray-300"
                }`}
              >
                <span>Other Screenings</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-gray-400">
                  {packages.filter((p) => !p.categoryId || !categoryMap.has(String(p.categoryId))).length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-16 text-center space-y-6">
            <LoadingSpinner size="large" color="white" text="Loading diagnostic packages..." />
            <div className="animate-pulse space-y-6 max-w-5xl mx-auto pt-4">
              <div className="h-48 bg-slate-800/60 rounded-2xl border border-slate-700/60"></div>
              <div className="h-48 bg-slate-800/60 rounded-2xl border border-slate-700/60"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Could Not Load Packages</h3>
            <p className="text-gray-300 text-sm">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-xl bg-slate-700/60 text-gray-400 flex items-center justify-center mx-auto">
              <Filter className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">No Diagnostic Packages Found</h3>
            <p className="text-gray-300 text-sm">
              We couldn't find any packages matching your search <strong className="text-white">"{searchQuery}"</strong>.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
              className="mt-2 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {selectedCategory === "ALL" && groupedSections ? (
              groupedSections.map((sec) => (
                <ClientCategorySection
                  key={sec.key}
                  category={sec.category}
                  packages={sec.packages}
                />
              ))
            ) : (
              <div className="bg-slate-800/60 rounded-2xl p-6 md:p-8 border border-slate-700/80 shadow-lg space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {selectedCategory === "UNCATEGORIZED" 
                        ? "General Screenings & Specialized Tests"
                        : selectedCategory !== "ALL" && categoryMap.get(String(selectedCategory))
                          ? categoryMap.get(String(selectedCategory)).name
                          : "Search Results"}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Showing <strong className="text-white">{filteredPackages.length}</strong> available diagnostic {filteredPackages.length === 1 ? "package" : "packages"}
                    </p>
                  </div>
                  {selectedCategory !== "ALL" && (
                    <button
                      onClick={() => setSelectedCategory("ALL")}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Show All Categories
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                  {filteredPackages.map((pkg) => {
                    const catName = pkg.categoryId && categoryMap.get(String(pkg.categoryId))
                      ? categoryMap.get(String(pkg.categoryId)).name
                      : null;
                    return (
                      <ClientPackageCard
                        key={pkg.packageId || pkg.id}
                        package={pkg}
                        categoryName={catName}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
