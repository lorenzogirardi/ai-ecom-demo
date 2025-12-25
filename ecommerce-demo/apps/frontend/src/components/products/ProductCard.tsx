"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  showQuickAdd?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  showQuickAdd = true,
}: ProductCardProps) {
  const {
    name,
    slug,
    price,
    compareAtPrice,
    imageUrl,
    category,
    inStock = true,
    rating,
    reviewCount,
  } = product;

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded">
                -{discount}%
              </span>
            )}
            {!inStock && (
              <span className="px-2 py-1 text-xs font-semibold bg-gray-800 text-white rounded">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick Actions */}
          {showQuickAdd && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 btn btn-primary btn-sm gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="btn btn-outline btn-sm bg-white hover:bg-gray-100"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {category && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {category.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {rating !== undefined && (
            <div className="mt-1 flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {reviewCount !== undefined && (
                <span className="text-xs text-gray-500">({reviewCount})</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              ${price.toFixed(2)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm text-gray-500 line-through">
                ${compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
