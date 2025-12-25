"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi, Product } from "@/lib/api";

export function useProducts(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => catalogApi.getProducts(params),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => catalogApi.getProduct(slug),
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => catalogApi.getFeaturedProducts(),
  });
}

// Helper to convert API product to component format
export function normalizeProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: typeof product.price === "string" ? parseFloat(product.price) : product.price,
    compareAtPrice: product.compareAt
      ? typeof product.compareAt === "string"
        ? parseFloat(product.compareAt)
        : product.compareAt
      : undefined,
    imageUrl: product.imageUrl,
    category: product.category,
    inStock: product.stock > 0,
  };
}
