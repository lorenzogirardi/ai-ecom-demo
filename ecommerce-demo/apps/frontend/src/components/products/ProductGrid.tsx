"use client";

import { ProductCard, Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({
  products,
  isLoading = false,
  onAddToCart,
  onAddToWishlist,
  emptyMessage = "No products found",
  columns = 4,
}: ProductGridProps) {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (isLoading) {
    return (
      <div className={`grid ${gridClasses[columns]} gap-6`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
