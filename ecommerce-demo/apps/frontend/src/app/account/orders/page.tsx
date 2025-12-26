"use client";

import Link from "next/link";
import { Package, ArrowRight, Loader2 } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order History</h1>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No orders yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start shopping to see your orders here.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="card p-6 block hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {item.name} x{item.quantity}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
