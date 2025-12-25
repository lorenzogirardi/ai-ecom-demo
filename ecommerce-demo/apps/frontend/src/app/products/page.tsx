"use client";

import { useState } from "react";
import { useProducts, normalizeProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCart } from "@/hooks/useCart";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Filter, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: productsData, isLoading: productsLoading } = useProducts({
    page,
    limit,
    categoryId: selectedCategory || undefined,
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { addItem } = useCart();

  const products = productsData?.data || [];
  const meta = productsData?.meta;

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const normalizedProducts = products.map(normalizeProduct);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600 mt-1">
            {meta?.total || 0} products available
          </p>
        </div>
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
            isLoading={productsLoading}
            onAddToCart={handleAddToCart}
            emptyMessage="No products found in this category"
          />

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
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
