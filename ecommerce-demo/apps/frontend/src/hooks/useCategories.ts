"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => catalogApi.getCategories(),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => catalogApi.getCategory(slug),
    enabled: !!slug,
  });
}
