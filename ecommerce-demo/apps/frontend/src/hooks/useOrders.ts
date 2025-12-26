import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";
import type { Order, Address } from "@/types";
import toast from "react-hot-toast";

export function useOrders() {
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.getOrders,
  });

  return {
    orders: orders || [],
    isLoading,
    error,
  };
}

export function useOrder(id: string) {
  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
  });

  return {
    order,
    isLoading,
    error,
  };
}

interface CreateOrderData {
  items: { productId: string; quantity: number }[];
  shippingAddress: Address;
  billingAddress?: Address;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateOrderData) =>
      ordersApi.create({
        items: data.items,
        shippingAddress: data.shippingAddress as unknown as Record<string, string>,
        billingAddress: data.billingAddress as unknown as Record<string, string>,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order placed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
