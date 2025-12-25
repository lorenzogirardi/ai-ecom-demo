"use client";

import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";
import { FolderOpen, ArrowRight } from "lucide-react";

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-6 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Categories
          </h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  // Filter to show only parent categories (no parentId)
  const parentCategories = categories?.filter((cat) => !cat.parentId) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600 mt-1">
          Browse our collection by category
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parentCategories.map((category) => {
          // Find subcategories
          const subcategories = categories?.filter(
            (cat) => cat.parentId === category.id
          );

          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group block"
            >
              <div className="card overflow-hidden transition-all duration-300 hover:shadow-lg">
                {/* Image */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FolderOpen className="w-16 h-16" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Category Name on Image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-xl font-bold text-white">
                      {category.name}
                    </h2>
                    {category._count && (
                      <p className="text-white/80 text-sm">
                        {category._count.products} products
                      </p>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {category.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}

                  {/* Subcategories */}
                  {subcategories && subcategories.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                        Subcategories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {subcategories.slice(0, 3).map((sub) => (
                          <span
                            key={sub.id}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {sub.name}
                          </span>
                        ))}
                        {subcategories.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                            +{subcategories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex items-center text-primary-600 group-hover:text-primary-700 font-medium">
                    <span>Browse Category</span>
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {parentCategories.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Categories Found
          </h2>
          <p className="text-gray-600">Check back later for new categories.</p>
        </div>
      )}
    </div>
  );
}
