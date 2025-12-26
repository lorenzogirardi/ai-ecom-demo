"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";

interface OrderDetailPageProps {
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

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const { order, isLoading, error } = useOrder(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Order not found
        </h2>
        <Link href="/account/orders" className="text-primary-600 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      {/* Order Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.orderNumber}
          </h1>
          <p className="text-gray-600">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
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

      {/* Order Items */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Items</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="p-6 flex justify-between items-center"
            >
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

      {/* Order Summary */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
            <span className="font-medium">${Number(order.tax).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold text-primary-600">
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
