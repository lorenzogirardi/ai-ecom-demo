"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Loader2 } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrderPage({ params }: OrderPageProps) {
  const { id } = use(params);
  const { order, isLoading, error } = useOrder(id);

  if (isLoading) {
    return (
      <div className="container-custom py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Order not found
        </h1>
        <p className="text-gray-600 mb-8">
          We couldn&apos;t find the order you&apos;re looking for.
        </p>
        <Link href="/account/orders" className="btn btn-primary">
          View All Orders
        </Link>
      </div>
    );
  }

  const isNewOrder = new Date(order.createdAt).getTime() > Date.now() - 60000;

  return (
    <div className="container-custom py-8">
      {/* Success Banner for new orders */}
      {isNewOrder && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-center gap-4">
          <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-green-800">
              Order Placed Successfully!
            </h2>
            <p className="text-green-700">
              Thank you for your order. We&apos;ll send you updates as it
              progresses.
            </p>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.orderNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            statusColors[order.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Order Items</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} x ${Number(item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  <span className="font-semibold">
                    ${Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ${Number(order.subtotal).toFixed(2)}
                </span>
              </div>
              {order.shipping && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    ${Number(order.shipping).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  ${Number(order.tax).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold text-primary-600">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/products"
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/account/orders"
                className="btn btn-outline w-full"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
