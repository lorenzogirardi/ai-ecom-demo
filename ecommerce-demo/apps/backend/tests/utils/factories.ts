import { PrismaClient, UserRole, ProductStatus, OrderStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

// Factory for creating test data
export class TestFactory {
  constructor(private prisma: PrismaClient) {}

  // Generate unique identifiers
  private generateId(): string {
    return randomBytes(12).toString("hex");
  }

  private generateEmail(): string {
    return `test-${this.generateId()}@example.com`;
  }

  private generateSlug(name: string): string {
    return `${name.toLowerCase().replace(/\s+/g, "-")}-${this.generateId().slice(0, 6)}`;
  }

  // User Factory
  async createUser(overrides: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
  }> = {}) {
    const hashedPassword = await bcrypt.hash(overrides.password || "password123", 10);

    return this.prisma.user.create({
      data: {
        email: overrides.email || this.generateEmail(),
        password: hashedPassword,
        firstName: overrides.firstName || "Test",
        lastName: overrides.lastName || "User",
        role: overrides.role || "CUSTOMER",
        isActive: overrides.isActive ?? true,
      },
    });
  }

  async createAdmin(overrides: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }> = {}) {
    return this.createUser({
      ...overrides,
      role: "ADMIN",
    });
  }

  // Category Factory
  async createCategory(overrides: Partial<{
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    parentId: string;
    isActive: boolean;
    sortOrder: number;
  }> = {}) {
    const name = overrides.name || `Category ${this.generateId().slice(0, 6)}`;

    return this.prisma.category.create({
      data: {
        name,
        slug: overrides.slug || this.generateSlug(name),
        description: overrides.description || `Description for ${name}`,
        imageUrl: overrides.imageUrl,
        parentId: overrides.parentId,
        isActive: overrides.isActive ?? true,
        sortOrder: overrides.sortOrder ?? 0,
      },
    });
  }

  // Product Factory
  async createProduct(overrides: Partial<{
    categoryId: string;
    sku: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAt: number;
    stock: number;
    imageUrl: string;
    images: string[];
    status: ProductStatus;
    isFeatured: boolean;
    metadata: Record<string, unknown>;
  }> = {}) {
    // Create category if not provided
    let categoryId = overrides.categoryId;
    if (!categoryId) {
      const category = await this.createCategory();
      categoryId = category.id;
    }

    const name = overrides.name || `Product ${this.generateId().slice(0, 6)}`;

    return this.prisma.product.create({
      data: {
        categoryId,
        sku: overrides.sku || `SKU-${this.generateId().slice(0, 8).toUpperCase()}`,
        name,
        slug: overrides.slug || this.generateSlug(name),
        description: overrides.description || `Description for ${name}`,
        price: overrides.price ?? 99.99,
        compareAt: overrides.compareAt ?? null,
        stock: overrides.stock ?? 100,
        imageUrl: overrides.imageUrl,
        images: overrides.images || [],
        status: overrides.status || "ACTIVE",
        isFeatured: overrides.isFeatured ?? false,
        metadata: overrides.metadata,
      },
      include: {
        category: true,
      },
    });
  }

  // Order Factory
  async createOrder(overrides: Partial<{
    userId: string;
    status: OrderStatus;
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: Record<string, string>;
    billingAddress: Record<string, string>;
    notes: string;
  }> = {}) {
    // Create user if not provided
    let userId = overrides.userId;
    if (!userId) {
      const user = await this.createUser();
      userId = user.id;
    }

    // Create products if items not provided
    const items = overrides.items || [];
    if (items.length === 0) {
      const product = await this.createProduct({ stock: 100 });
      items.push({ productId: product.id, quantity: 1 });
    }

    // Get products for price calculation
    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemSubtotal = Number(product.price) * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
      };
    });

    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax;

    const shippingAddress = overrides.shippingAddress || {
      firstName: "Test",
      lastName: "User",
      address1: "123 Test St",
      city: "Test City",
      state: "TS",
      postalCode: "12345",
      country: "US",
    };

    // Decrement stock for each item (simulating real order creation)
    for (const item of items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return this.prisma.order.create({
      data: {
        orderNumber: `ORD-${this.generateId().slice(0, 10).toUpperCase()}`,
        userId,
        status: overrides.status || "PENDING",
        subtotal,
        tax,
        shippingAmount: 0,
        totalAmount,
        shippingAddress,
        billingAddress: overrides.billingAddress || shippingAddress,
        notes: overrides.notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });
  }

  // Cleanup utilities
  async cleanupAll() {
    // Delete in correct order to respect foreign key constraints
    await this.prisma.orderItem.deleteMany();
    await this.prisma.order.deleteMany();
    await this.prisma.product.deleteMany();
    await this.prisma.category.deleteMany();
    await this.prisma.session.deleteMany();
    await this.prisma.user.deleteMany();
  }

  async cleanupUsers() {
    await this.prisma.session.deleteMany();
    await this.prisma.order.deleteMany();
    await this.prisma.user.deleteMany();
  }

  async cleanupProducts() {
    await this.prisma.orderItem.deleteMany();
    await this.prisma.product.deleteMany();
    await this.prisma.category.deleteMany();
  }

  async cleanupOrders() {
    await this.prisma.orderItem.deleteMany();
    await this.prisma.order.deleteMany();
  }
}

// Helper to create authentication header
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

// Test data generators
export const testData = {
  validUser: {
    email: "test@example.com",
    password: "password123",
    firstName: "Test",
    lastName: "User",
  },

  validProduct: {
    sku: "TEST-SKU-001",
    name: "Test Product",
    slug: "test-product",
    description: "A test product description",
    price: 99.99,
    stock: 100,
    status: "ACTIVE" as ProductStatus,
  },

  validCategory: {
    name: "Test Category",
    slug: "test-category",
    description: "A test category description",
  },

  validAddress: {
    firstName: "John",
    lastName: "Doe",
    address1: "123 Main St",
    address2: "Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "US",
    phone: "+1234567890",
  },

  invalidEmail: "not-an-email",
  shortPassword: "short",
  emptyString: "",
};
