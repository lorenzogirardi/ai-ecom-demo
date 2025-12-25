"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
}

export interface CartItemData {
  id: string;
  product: CartProduct;
  quantity: number;
}

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: CartItemProps) {
  const { product, quantity } = item;
  const subtotal = product.price * quantity;

  const handleIncrement = () => {
    onUpdateQuantity?.(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity?.(item.id, quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove?.(item.id);
  };

  return (
    <div
      className={`flex gap-4 py-4 ${
        isUpdating ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${product.slug}`}
          className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
        >
          {product.name}
        </Link>

        <p className="mt-1 text-sm text-gray-500">
          ${product.price.toFixed(2)} each
        </p>

        {/* Quantity Controls */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1 || isUpdating}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={isUpdating}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            aria-label="Remove from cart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex-shrink-0 text-right">
        <p className="font-semibold text-gray-900">${subtotal.toFixed(2)}</p>
      </div>
    </div>
  );
}
