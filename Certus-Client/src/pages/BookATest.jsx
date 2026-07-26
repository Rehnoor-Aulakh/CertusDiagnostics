import React, { useState, useEffect, useMemo, useCallback } from "react";
import { API_BASE_URL } from "../config/api";
import ClientCategorySection from "../components/packages/ClientCategorySection";
import ClientPackageCard from "../components/packages/ClientPackageCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, Sparkles, ShieldCheck, Activity, Clock, RefreshCw, AlertTriangle, Filter, Layers, ArrowUpDown, X } from "lucide-react";

/**
 * BookATest Page Component
 * Patient-facing diagnostic test and package catalog for Certus Diagnostics Client App.
 * Features stunning UI matching HealthHistory & YourReports (dark navy gradient, glassmorphism).
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
      // 1. Fetch Categories (try viewer endpoint, fallback to standard endpoints)
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

      // 2. Fetch Packages (try viewer endpoint, fallback to standard endpoints)
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
        
        // Sort categories by displayOrder
        fetchedCats.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        // Sort packages by displayOrder
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
      // default displayOrder
      result.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }

    return result;
  }, [packages, searchQuery, selectedCategory, categoryMap, sortBy]);

  // Group packages by category for the "ALL" view
  const groupedSections = useMemo(() => {
    if (selectedCategory !== "ALL") return null;

    const sections = [];
    const usedPackageIds = new Set();

    // Create a section for each category in display order
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

    // Uncategorized packages
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Subtle Pattern Overlay matching HealthHistory & YourReports */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICA8L3BhdHRlcm4+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgogICAgPC9zdmc+')] opacity-30 pointer-events-none"></div>
      
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl space-y-10">
        
        {/* Hero Header Section */}
        <div className="text-center max-w-4xl mx-auto space-y-4 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-blue-500/10">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>NABL Certified Diagnostic Center</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent leading-tight">
            Book Diagnostic Tests & Packages
          </h1>
          
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            Explore our comprehensive range of specialized health screenings. Select a package to zoom into detailed test parameters or schedule free home sample pickup instantly.
          </p>

          {/* Trust Highlights Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-200">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>100+ Specialized Tests</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% CAP & NABL Accredited Quality</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>24-48 Hr Fast Digital Reports</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl space-y-6">
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Live Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by package name, category, or health condition (e.g. Hairfall, Diabetes, Full Body)..."
                className="w-full bg-slate-900/80 text-white pl-12 pr-10 py-3.5 rounded-2xl border border-white/15 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-sm md:text-base transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="w-full md:w-auto flex items-center gap-2 bg-slate-900/80 border border-white/15 rounded-2xl px-4 py-2 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer py-1"
              >
                <option value="default" className="bg-slate-900 text-white">Featured / Default Order</option>
                <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="tests_desc" className="bg-slate-900 text-white">Most Tests Included</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 ${
                selectedCategory === "ALL"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105 border border-blue-400/40"
                  : "bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Packages ({packages.length})</span>
            </button>

            {categories.map((cat) => {
              const catIdStr = String(cat.categoryId || cat.id);
              const count = packages.filter((p) => String(p.categoryId) === catIdStr).length;
              if (count === 0 && selectedCategory !== catIdStr) return null; // Hide empty categories unless selected

              return (
                <button
                  key={catIdStr}
                  onClick={() => setSelectedCategory(catIdStr)}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 ${
                    selectedCategory === catIdStr
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105 border border-blue-400/40"
                      : "bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === catIdStr ? "bg-white/20 text-white" : "bg-white/10 text-gray-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {packages.some((p) => !p.categoryId || !categoryMap.has(String(p.categoryId))) && (
              <button
                onClick={() => setSelectedCategory("UNCATEGORIZED")}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 shrink-0 ${
                  selectedCategory === "UNCATEGORIZED"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105 border border-blue-400/40"
                    : "bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10"
                }`}
              >
                <span>Other Screenings</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                  {packages.filter((p) => !p.categoryId || !categoryMap.has(String(p.categoryId))).length}
                </span>
              </button>
            )}
          </div>

        </div>

        {/* Content Section */}
        {loading ? (
          /* Loading State matching HealthHistory.jsx */
          <div className="py-16 text-center space-y-6">
            <LoadingSpinner size="large" color="white" text="Fetching diagnostic packages & flyers..." />
            <div className="animate-pulse space-y-6 max-w-5xl mx-auto pt-6">
              <div className="h-64 bg-white/5 rounded-3xl border border-white/10"></div>
              <div className="h-64 bg-white/5 rounded-3xl border border-white/10"></div>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-500/10 border border-red-500/40 rounded-3xl p-10 text-center max-w-2xl mx-auto space-y-4 backdrop-blur-lg shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Oops! Could Not Load Packages</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : filteredPackages.length === 0 ? (
          /* Empty State */
          <div className="bg-white/5 backdrop-blur-lg border border-white/15 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-gray-400 flex items-center justify-center mx-auto border border-white/10">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">No Diagnostic Packages Found</h3>
            <p className="text-gray-300 text-base">
              We couldn't find any packages matching your search <strong className="text-white">"{searchQuery}"</strong> or selected category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
              className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          /* Display Packages */
          <div className="space-y-10 animate-fadeIn">
            {selectedCategory === "ALL" && groupedSections ? (
              /* View Grouped by Category */
              groupedSections.map((sec) => (
                <ClientCategorySection
                  key={sec.key}
                  category={sec.category}
                  packages={sec.packages}
                />
              ))
            ) : (
              /* Single Category or Search Results View */
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {selectedCategory === "UNCATEGORIZED" 
                        ? "General Screenings & Specialized Tests"
                        : selectedCategory !== "ALL" && categoryMap.get(String(selectedCategory))
                          ? categoryMap.get(String(selectedCategory)).name
                          : "Search Results"}
                    </h2>
                    <p className="text-sm text-gray-300 mt-1">
                      Showing <strong className="text-blue-400 font-semibold">{filteredPackages.length}</strong> available diagnostic {filteredPackages.length === 1 ? "package" : "packages"}
                    </p>
                  </div>
                  {selectedCategory !== "ALL" && (
                    <button
                      onClick={() => setSelectedCategory("ALL")}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                    >
                      Show All Categories
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                  {filteredPackages.map((pkg) => {
                    const catName = pkg.categoryId && categoryMap.get(String(pkg.categoryId))
                      ? categoryMap.get(String(pkg.categoryId)).name
                      : "Diagnostic Screening";
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
