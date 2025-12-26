import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOrders, useOrder, useCreateOrder } from "@/hooks/useOrders";
import { ordersApi } from "@/lib/api";
import { ReactNode } from "react";
import toast from "react-hot-toast";

// Mock the API
vi.mock("@/lib/api", () => ({
  ordersApi: {
    getOrders: vi.fn(),
    getOrder: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
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

describe("useOrders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch orders", async () => {
    const mockOrders = [
      {
        id: "1",
        orderNumber: "ORD-001",
        status: "PENDING",
        subtotal: "100.00",
        tax: "10.00",
        totalAmount: "110.00",
        items: [],
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        orderNumber: "ORD-002",
        status: "SHIPPED",
        subtotal: "200.00",
        tax: "20.00",
        totalAmount: "220.00",
        items: [],
        createdAt: "2024-01-02T00:00:00Z",
      },
    ];

    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockOrders);

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.orders).toEqual(mockOrders);
    expect(ordersApi.getOrders).toHaveBeenCalled();
  });

  it("should return empty array when no orders", async () => {
    vi.mocked(ordersApi.getOrders).mockResolvedValue(null);

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.orders).toEqual([]);
  });

  it("should handle fetch error", async () => {
    vi.mocked(ordersApi.getOrders).mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});

describe("useOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch single order by id", async () => {
    const mockOrder = {
      id: "1",
      orderNumber: "ORD-001",
      status: "PENDING",
      subtotal: "100.00",
      tax: "10.00",
      totalAmount: "110.00",
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          name: "Test Product",
          quantity: 2,
          unitPrice: "50.00",
          subtotal: "100.00",
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
    };

    vi.mocked(ordersApi.getOrder).mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useOrder("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.order).toEqual(mockOrder);
    expect(ordersApi.getOrder).toHaveBeenCalledWith("1");
  });

  it("should not fetch when id is empty", async () => {
    const { result } = renderHook(() => useOrder(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(ordersApi.getOrder).not.toHaveBeenCalled();
  });
});

describe("useCreateOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create order successfully", async () => {
    const mockResponse = {
      data: {
        id: "new-order-1",
        orderNumber: "ORD-003",
        status: "PENDING",
      },
    };

    vi.mocked(ordersApi.create).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    const orderData = {
      items: [{ productId: "prod-1", quantity: 2 }],
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
      },
    };

    await result.current.createOrder(orderData);

    expect(ordersApi.create).toHaveBeenCalledWith({
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      billingAddress: undefined,
    });

    expect(toast.success).toHaveBeenCalledWith("Order placed successfully!");
  });

  it("should handle create order error", async () => {
    vi.mocked(ordersApi.create).mockRejectedValue(new Error("Payment failed"));

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    const orderData = {
      items: [{ productId: "prod-1", quantity: 2 }],
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
      },
    };

    try {
      await result.current.createOrder(orderData);
    } catch {
      // Expected to throw
    }

    expect(toast.error).toHaveBeenCalledWith("Payment failed");
  });

  it("should use different billing address when provided", async () => {
    const mockResponse = { data: { id: "new-order-1" } };
    vi.mocked(ordersApi.create).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    const shippingAddress = {
      firstName: "John",
      lastName: "Doe",
      street: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "US",
    };

    const billingAddress = {
      firstName: "Jane",
      lastName: "Doe",
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90001",
      country: "US",
    };

    await result.current.createOrder({
      items: [{ productId: "prod-1", quantity: 1 }],
      shippingAddress,
      billingAddress,
    });

    expect(ordersApi.create).toHaveBeenCalledWith({
      items: [{ productId: "prod-1", quantity: 1 }],
      shippingAddress,
      billingAddress,
    });
  });
});
