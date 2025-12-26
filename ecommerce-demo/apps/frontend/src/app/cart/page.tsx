"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();

  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push("/checkout");
    } else {
      router.push("/auth/login?redirect=/checkout");
    }
  };

  const subtotal = getTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    toast.success(`${productName} removed from cart`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet. Start
            shopping to fill it up!
          </p>
          <Link href="/products" className="btn btn-primary btn-lg gap-2">
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <button
          onClick={handleClearCart}
          className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="card divide-y">
            {items.map(({ product, quantity }) => {
              const price =
                typeof product.price === "string"
                  ? parseFloat(product.price)
                  : product.price;
              const itemTotal = price * quantity;

              return (
                <div key={product.id} className="p-4 flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    {product.category && (
                      <p className="text-sm text-gray-500">
                        {product.category.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      SKU: {product.sku}
                    </p>

                    {/* Mobile Price */}
                    <p className="font-semibold text-gray-900 mt-2 lg:hidden">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    {/* Desktop Price */}
                    <p className="font-semibold text-gray-900 hidden lg:block">
                      ${itemTotal.toFixed(2)}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateQuantity(product.id, quantity - 1)
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(product.id, quantity + 1)
                        }
                        disabled={quantity >= product.stock}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveItem(product.id, product.name)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Free Shipping Notice */}
            {subtotal < 50 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                Add ${(50 - subtotal).toFixed(2)} more for free shipping!
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full btn btn-primary btn-lg mt-6"
            >
              Proceed to Checkout
            </button>

            {/* Payment Icons */}
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-10 h-6 bg-gray-200 rounded" />
              <div className="w-10 h-6 bg-gray-200 rounded" />
              <div className="w-10 h-6 bg-gray-200 rounded" />
              <div className="w-10 h-6 bg-gray-200 rounded" />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
