import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSearch, useSearchSuggestions, usePopularSearches } from "@/hooks/useSearch";
import { searchApi } from "@/lib/api";
import { ReactNode } from "react";

// Mock the API
vi.mock("@/lib/api", () => ({
  searchApi: {
    search: vi.fn(),
    suggest: vi.fn(),
    popular: vi.fn(),
  },
}));

// Wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not fetch when query is too short", async () => {
    const { result } = renderHook(() => useSearch("a"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.products).toEqual([]);
    expect(searchApi.search).not.toHaveBeenCalled();
  });

  it("should fetch search results when query is valid", async () => {
    const mockProducts = [
      { id: "1", name: "iPhone", slug: "iphone", price: 999 },
      { id: "2", name: "iPad", slug: "ipad", price: 799 },
    ];
    const mockCategories = [{ id: "1", name: "Electronics", slug: "electronics" }];

    vi.mocked(searchApi.search).mockResolvedValue({
      data: {
        products: mockProducts,
        categories: mockCategories,
        total: 3,
      },
    });

    const { result } = renderHook(() => useSearch("iphone"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.categories).toEqual(mockCategories);
    expect(searchApi.search).toHaveBeenCalledWith("iphone");
  });

  it("should respect enabled option", async () => {
    const { result } = renderHook(() => useSearch("iphone", { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(searchApi.search).not.toHaveBeenCalled();
  });

  it("should handle search error", async () => {
    vi.mocked(searchApi.search).mockRejectedValue(new Error("Search failed"));

    const { result } = renderHook(() => useSearch("test"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});

describe("useSearchSuggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not fetch suggestions when query is too short", async () => {
    const { result } = renderHook(() => useSearchSuggestions("a"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.suggestions).toEqual([]);
    expect(searchApi.suggest).not.toHaveBeenCalled();
  });

  it("should fetch suggestions when query is valid", async () => {
    const mockSuggestions = {
      products: [{ id: "1", name: "iPhone" }],
      categories: [{ id: "1", name: "Electronics" }],
    };

    vi.mocked(searchApi.suggest).mockResolvedValue(mockSuggestions);

    const { result } = renderHook(() => useSearchSuggestions("iph"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.suggestions).toEqual(mockSuggestions);
    expect(searchApi.suggest).toHaveBeenCalledWith("iph");
  });
});

describe("usePopularSearches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch popular searches", async () => {
    const mockPopular = {
      featuredProducts: [{ id: "1", name: "Popular Product" }],
      topCategories: [{ id: "1", name: "Top Category" }],
    };

    vi.mocked(searchApi.popular).mockResolvedValue(mockPopular);

    const { result } = renderHook(() => usePopularSearches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.popular).toEqual(mockPopular);
    expect(searchApi.popular).toHaveBeenCalled();
  });

  it("should return empty array when no popular data", async () => {
    vi.mocked(searchApi.popular).mockResolvedValue(null);

    const { result } = renderHook(() => usePopularSearches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.popular).toEqual([]);
  });
});
