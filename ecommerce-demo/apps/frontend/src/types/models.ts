// Product & Catalog Types

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

// Order Types

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string;
  tax: string;
  shippingAmount: string;
  totalAmount: string;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
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
  product?: Product;
}

export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}
