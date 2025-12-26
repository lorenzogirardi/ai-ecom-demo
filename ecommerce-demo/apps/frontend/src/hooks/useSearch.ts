import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api";
import type { Product, Category } from "@/types";

interface SearchResults {
  products: Product[];
  categories: Category[];
  total: number;
}

export function useSearch(query: string, options?: { enabled?: boolean }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const response = await searchApi.search(query);
      return response.data as SearchResults;
    },
    enabled: (options?.enabled ?? true) && query.length >= 2,
    staleTime: 30 * 1000,
  });

  return {
    results: data,
    products: data?.products || [],
    categories: data?.categories || [],
    total: data?.total || 0,
    isLoading,
    error,
  };
}

export function useSearchSuggestions(query: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: () => searchApi.suggest(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });

  return {
    suggestions: data || [],
    isLoading,
  };
}

export function usePopularSearches() {
  const { data, isLoading } = useQuery({
    queryKey: ["popular-searches"],
    queryFn: searchApi.popular,
    staleTime: 5 * 60 * 1000,
  });

  return {
    popular: data || [],
    isLoading,
  };
}
