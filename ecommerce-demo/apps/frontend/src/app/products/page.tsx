"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProducts, normalizeProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSearch } from "@/hooks/useSearch";
import { useCart } from "@/hooks/useCart";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Sync category from URL
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Use search if query exists, otherwise use regular products
  const { products: searchProducts, isLoading: searchLoading } = useSearch(
    searchQuery,
    { enabled: !!searchQuery }
  );

  const { data: productsData, isLoading: productsLoading } = useProducts({
    page,
    limit,
    categoryId: selectedCategory || undefined,
  });

  const isSearching = !!searchQuery;

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { addItem } = useCart();

  const products = isSearching ? searchProducts : (productsData?.data || []);
  const meta = productsData?.meta;
  const isLoading = isSearching ? searchLoading : productsLoading;

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const clearSearch = () => {
    router.push("/products");
  };

  const normalizedProducts = products.map(normalizeProduct);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSearching ? `Search: "${searchQuery}"` : "All Products"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isSearching
              ? `${products.length} results found`
              : `${meta?.total || 0} products available`}
          </p>
        </div>
        {isSearching && (
          <button
            onClick={clearSearch}
            className="mt-4 md:mt-0 btn btn-outline flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Search
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-5 h-5" />
              <h2 className="font-semibold">Filters</h2>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === ""
                      ? "bg-primary-100 text-primary-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  All Categories
                </button>
                {!categoriesLoading &&
                  categories?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary-100 text-primary-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                      {category._count && (
                        <span className="text-gray-400 ml-1">
                          ({category._count.products})
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <ProductGrid
            products={normalizedProducts}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
            emptyMessage={isSearching ? "No products match your search" : "No products found in this category"}
          />

          {/* Pagination - only show when not searching */}
          {!isSearching && meta && meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="btn btn-outline disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
