"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCategory } from "@/hooks/useCategories";
import { useProducts, normalizeProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FolderOpen, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: category, isLoading: categoryLoading } = useCategory(slug);
  const { data: productsData, isLoading: productsLoading } = useProducts({
    page,
    limit,
    categoryId: category?.id,
  });
  const { addItem } = useCart();

  const products = productsData?.data || [];
  const meta = productsData?.meta;

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const normalizedProducts = products.map(normalizeProduct);

  if (categoryLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
          <div className="h-48 bg-gray-200 rounded-lg mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-6 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Category Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The category you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/categories" className="btn btn-primary">
            Browse Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-primary-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-primary-600">
          Categories
        </Link>
        <span>/</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-8">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-600 to-primary-800" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-white/90 max-w-2xl">{category.description}</p>
          )}
          {meta && (
            <p className="text-white/80 mt-2">
              {meta.total} products in this category
            </p>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Subcategories
          </h2>
          <div className="flex flex-wrap gap-3">
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                {sub.name}
                {sub._count && (
                  <span className="text-gray-400 ml-2">
                    ({sub._count.products})
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Products</h2>
        <ProductGrid
          products={normalizedProducts}
          isLoading={productsLoading}
          onAddToCart={handleAddToCart}
          emptyMessage="No products in this category yet"
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
      </div>

      {/* Back Link */}
      <div className="mt-12">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Categories
        </Link>
      </div>
    </div>
  );
}
