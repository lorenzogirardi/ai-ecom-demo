"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOrder } from "@/hooks/useOrders";
import { AddressForm } from "@/components/checkout/AddressForm";
import type { Address } from "@/types";

const emptyAddress: Address = {
  firstName: "",
  lastName: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getTotal, clearCart } = useCart();
  const { createOrder, isLoading } = useCreateOrder();

  const [shippingAddress, setShippingAddress] = useState<Address>({
    ...emptyAddress,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Address>(emptyAddress);
  const [error, setError] = useState("");

  const subtotal = getTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const validateAddress = (address: Address): boolean => {
    return !!(
      address.firstName &&
      address.lastName &&
      address.street &&
      address.city &&
      address.state &&
      address.postalCode &&
      address.country
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!validateAddress(shippingAddress)) {
      setError("Please fill in all required shipping address fields");
      return;
    }

    if (!useSameAddress && !validateAddress(billingAddress)) {
      setError("Please fill in all required billing address fields");
      return;
    }

    try {
      // Transform address format: frontend uses 'street', backend expects 'address1'
      const transformAddress = (addr: Address) => ({
        firstName: addr.firstName,
        lastName: addr.lastName,
        address1: addr.street,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        phone: addr.phone,
      });

      const orderData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: transformAddress(shippingAddress),
        billingAddress: transformAddress(useSameAddress ? shippingAddress : billingAddress),
      };

      const result = await createOrder(orderData);
      clearCart();
      router.push(`/orders/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h1>
        <p className="text-gray-600 mb-8">Add some products before checkout.</p>
        <Link href="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to cart
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Shipping Address */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              <AddressForm
                title="Shipping"
                address={shippingAddress}
                onChange={setShippingAddress}
                disabled={isLoading}
              />
            </div>

            {/* Billing Address */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold">Billing Address</h2>
              </div>

              <label className="flex items-center gap-2 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <span className="text-gray-700">
                  Same as shipping address
                </span>
              </label>

              {!useSameAddress && (
                <AddressForm
                  title="Billing"
                  address={billingAddress}
                  onChange={setBillingAddress}
                  disabled={isLoading}
                />
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Place Order"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>

              {shipping === 0 && (
                <p className="mt-4 text-center text-sm text-green-600">
                  You qualify for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
