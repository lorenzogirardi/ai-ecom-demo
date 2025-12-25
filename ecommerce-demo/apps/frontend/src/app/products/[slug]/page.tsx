"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  ArrowLeft,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useProduct(slug);
  const { addItem } = useCart();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-6 w-1/4 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-12 w-48 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const price =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;
  const compareAt = product.compareAt
    ? typeof product.compareAt === "string"
      ? parseFloat(product.compareAt)
      : product.compareAt
    : null;
  const discount = compareAt
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : 0;
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-primary-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-600">
          Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-primary-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="w-24 h-24" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {discount > 0 && (
              <span className="px-3 py-1 text-sm font-semibold bg-red-500 text-white rounded">
                -{discount}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="px-3 py-1 text-sm font-semibold bg-primary-500 text-white rounded">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          {/* Category */}
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-sm text-primary-600 hover:text-primary-700 uppercase tracking-wide"
            >
              {product.category.name}
            </Link>
          )}

          {/* Name */}
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {product.name}
          </h1>

          {/* SKU */}
          <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
            {compareAt && compareAt > price && (
              <span className="text-xl text-gray-500 line-through">
                ${compareAt.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-4">
            {inStock ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span>In Stock ({product.stock} available)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <span>Out of Stock</span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Add to Cart */}
          <div className="mt-8 space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 btn btn-primary btn-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="btn btn-outline btn-lg">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Truck className="w-6 h-6 text-primary-600" />
              <div className="text-sm">
                <p className="font-medium">Free Shipping</p>
                <p className="text-gray-500">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-6 h-6 text-primary-600" />
              <div className="text-sm">
                <p className="font-medium">Secure Payment</p>
                <p className="text-gray-500">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <RotateCcw className="w-6 h-6 text-primary-600" />
              <div className="text-sm">
                <p className="font-medium">Easy Returns</p>
                <p className="text-gray-500">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </Link>
      </div>
    </div>
  );
}
