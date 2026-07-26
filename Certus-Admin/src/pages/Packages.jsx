import { useState, useEffect } from "react"
import API_ENDPOINTS from "../utils/api";
import PackageCard from "../components/packages/PackageCard";

export default function Packages() {
    const [packageData, setPackageData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = JSON.parse(localStorage.getItem("adminUser"))?.token;
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };
            const [categoryResponse, packageResponse] = await Promise.all([
                fetch(API_ENDPOINTS.packageCategories, { headers }),
                fetch(API_ENDPOINTS.packages, { headers }),
            ]);
            if (!categoryResponse.ok || !packageResponse.ok) {
                throw new Error("Failed to load package data");
            }
            const categoryJson = await categoryResponse.json();
            const packageJson = await packageResponse.json();

            const categories = categoryJson.data;
            const packages = packageJson.data;
            const groupedCategories = categories?.map(category => ({
                // this category remains as it is
                ...category,
                packages: packages.filter(
                    pkg => pkg.categoryId === category.categoryId
                ).map(pkg => ({ ...pkg, categoryName: category.name }))
            }));
            const uncategorized = packages.filter(pkg => pkg.categoryId == null)
                .map(pkg => ({ ...pkg, categoryName: "Uncategorized" }));
            if (uncategorized.length > 0) {
                groupedCategories.push({
                    categoryId: null,
                    name: "Uncategorized",
                    packages: uncategorized
                });
            }
            console.log(groupedCategories);
            setPackageData(groupedCategories || []);
        } catch (error) {
            console.log("Error fetching", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    // call this function on initial render
    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                <p className="font-bold">Error loading packages</p>
                <p className="text-sm mt-1">{error}</p>
                <button 
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // render this
    return (
        <div className="space-y-8">
            {packageData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">No packages or categories found.</p>
                </div>
            ) : (
                packageData.map(category => (
                    <div key={category.categoryId || "uncategorized"} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                        <div className="flex items-center justify-between border-b border-gray-200/80 pb-4 mb-6">
                            <div className="flex items-center space-x-3">
                                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{category.name}</h2>
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                                    {category.packages?.length || 0} Packages
                                </span>
                            </div>
                        </div>
                        
                        {category.packages && category.packages.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {category.packages.map(pkg => (
                                    <PackageCard
                                        key={pkg.packageId || Math.random()}
                                        package={pkg}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No packages in this category.</p>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}