import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Optionally redirect to login
      }
    }
    return Promise.reject(error);
  }
);

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    products: number;
  };
  children?: Category[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: string | number;
  compareAt?: string | number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
  category?: Category;
  categoryId: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  tax: string;
  shippingAmount: string;
  totalAmount: string;
  items: OrderItem[];
  shippingAddress?: Record<string, string>;
  billingAddress?: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

// API Functions
export const catalogApi = {
  getCategories: async () => {
    const { data } = await api.get<ApiResponse<Category[]>>("/catalog/categories");
    return data.data;
  },

  getCategory: async (slug: string) => {
    const { data } = await api.get<ApiResponse<Category>>(`/catalog/categories/${slug}`);
    return data.data;
  },

  getProducts: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    status?: string;
    featured?: boolean;
  }) => {
    const { data } = await api.get<ApiResponse<Product[]>>("/catalog/products", { params });
    return data;
  },

  getProduct: async (slug: string) => {
    const { data } = await api.get<ApiResponse<Product>>(`/catalog/products/${slug}`);
    return data.data;
  },

  getFeaturedProducts: async () => {
    const { data } = await api.get<ApiResponse<Product[]>>("/catalog/products", {
      params: { featured: true, limit: 8 },
    });
    return data.data;
  },
};

export const searchApi = {
  search: async (query: string, params?: { type?: string; page?: number; limit?: number }) => {
    const { data } = await api.get("/search", { params: { q: query, ...params } });
    return data;
  },

  suggest: async (query: string) => {
    const { data } = await api.get("/search/suggest", { params: { q: query } });
    return data.data;
  },

  popular: async () => {
    const { data } = await api.get("/search/popular");
    return data.data;
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const { data } = await api.post("/auth/register", userData);
    return data;
  },

  me: async () => {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },

  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },
};

export const ordersApi = {
  create: async (orderData: {
    items: { productId: string; quantity: number }[];
    shippingAddress: Record<string, string>;
    billingAddress?: Record<string, string>;
  }) => {
    const { data } = await api.post("/orders", orderData);
    return data;
  },

  getOrders: async () => {
    const { data } = await api.get<ApiResponse<Order[]>>("/orders");
    return data.data;
  },

  getOrder: async (id: string) => {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data;
  },
};
