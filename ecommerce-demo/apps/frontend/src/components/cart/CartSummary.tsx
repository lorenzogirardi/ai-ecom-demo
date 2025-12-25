"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  itemCount: number;
  isCheckingOut?: boolean;
  onCheckout?: () => void;
  showCheckoutButton?: boolean;
}

export function CartSummary({
  subtotal,
  shipping,
  tax,
  discount,
  total,
  itemCount,
  isCheckingOut = false,
  onCheckout,
  showCheckoutButton = true,
}: CartSummaryProps) {
  const handleCheckout = () => {
    onCheckout?.();
  };

  return (
    <div className="card p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-medium text-gray-900">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {/* Shipping */}
        {shipping !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-gray-900">
              {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
            </span>
          </div>
        )}

        {/* Tax */}
        {tax !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated Tax</span>
            <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
          </div>
        )}

        {/* Discount */}
        {discount !== undefined && discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="font-medium text-green-600">
              -${discount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Total */}
        <div className="flex justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <div className="mt-6 space-y-3">
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut || itemCount === 0}
            className="btn btn-primary w-full gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <Link
            href="/products"
            className="btn btn-outline w-full gap-2 justify-center"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Free Shipping Notice */}
      {shipping === undefined && subtotal < 50 && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700">
            Add ${(50 - subtotal).toFixed(2)} more for{" "}
            <span className="font-semibold">free shipping!</span>
          </p>
          <div className="mt-2 h-2 bg-primary-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Secure Checkout Notice */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Secure checkout powered by Stripe
      </p>
    </div>
  );
}
