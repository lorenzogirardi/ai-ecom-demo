import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

describe("Database Tests with Testcontainers", () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaClient;
  let originalDatabaseUrl: string | undefined;

  beforeAll(async () => {
    // Save original DATABASE_URL to restore after tests
    originalDatabaseUrl = process.env.DATABASE_URL;

    // Start PostgreSQL container
    container = await new PostgreSqlContainer("postgres:15-alpine")
      .withDatabase("test_db")
      .withUsername("test")
      .withPassword("test")
      .withExposedPorts(5432)
      .start();

    // Set DATABASE_URL for Prisma (only for this test file's Prisma client)
    const connectionUri = container.getConnectionUri();
    process.env.DATABASE_URL = connectionUri;

    // Push schema to test database
    execSync("npx prisma db push --skip-generate", {
      env: { ...process.env, DATABASE_URL: connectionUri },
      cwd: process.cwd(),
    });

    // Initialize Prisma client
    prisma = new PrismaClient({
      datasources: {
        db: { url: connectionUri },
      },
    });

    await prisma.$connect();
  }, 120000); // 2 minute timeout for container startup

  afterAll(async () => {
    await prisma.$disconnect();
    await container.stop();
    // Restore original DATABASE_URL for other tests
    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  beforeEach(async () => {
    // Clean all tables before each test
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("User CRUD Operations", () => {
    it("should create a user", async () => {
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          password: "hashedpassword",
          firstName: "Test",
          lastName: "User",
        },
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe("test@example.com");
      expect(user.role).toBe("CUSTOMER");
      expect(user.isActive).toBe(true);
    });

    it("should enforce unique email constraint", async () => {
      await prisma.user.create({
        data: {
          email: "unique@example.com",
          password: "password",
        },
      });

      await expect(
        prisma.user.create({
          data: {
            email: "unique@example.com",
            password: "password",
          },
        })
      ).rejects.toThrow();
    });

    it("should update user", async () => {
      const user = await prisma.user.create({
        data: {
          email: "update@example.com",
          password: "password",
        },
      });

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: "Updated",
          lastName: "Name",
        },
      });

      expect(updated.firstName).toBe("Updated");
      expect(updated.lastName).toBe("Name");
    });

    it("should delete user", async () => {
      const user = await prisma.user.create({
        data: {
          email: "delete@example.com",
          password: "password",
        },
      });

      await prisma.user.delete({
        where: { id: user.id },
      });

      const found = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(found).toBeNull();
    });
  });

  describe("Category CRUD Operations", () => {
    it("should create category with hierarchy", async () => {
      const parent = await prisma.category.create({
        data: {
          name: "Parent Category",
          slug: "parent-category",
        },
      });

      const child = await prisma.category.create({
        data: {
          name: "Child Category",
          slug: "child-category",
          parentId: parent.id,
        },
      });

      expect(child.parentId).toBe(parent.id);

      // Verify relationship
      const parentWithChildren = await prisma.category.findUnique({
        where: { id: parent.id },
        include: { children: true },
      });

      expect(parentWithChildren?.children.length).toBe(1);
      expect(parentWithChildren?.children[0].id).toBe(child.id);
    });

    it("should enforce unique slug constraint", async () => {
      await prisma.category.create({
        data: {
          name: "Category",
          slug: "unique-slug",
        },
      });

      await expect(
        prisma.category.create({
          data: {
            name: "Another Category",
            slug: "unique-slug",
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("Product CRUD Operations", () => {
    it("should create product with category relation", async () => {
      const category = await prisma.category.create({
        data: {
          name: "Electronics",
          slug: "electronics",
        },
      });

      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: "PROD-001",
          name: "Test Product",
          slug: "test-product",
          price: 99.99,
          stock: 100,
        },
        include: { category: true },
      });

      expect(product.category.id).toBe(category.id);
      expect(Number(product.price)).toBe(99.99);
    });

    it("should enforce foreign key constraint", async () => {
      await expect(
        prisma.product.create({
          data: {
            categoryId: "nonexistent-id",
            sku: "PROD-002",
            name: "Invalid Product",
            slug: "invalid-product",
            price: 50,
          },
        })
      ).rejects.toThrow();
    });

    it("should handle Decimal price correctly", async () => {
      const category = await prisma.category.create({
        data: { name: "Test", slug: "test" },
      });

      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: "DECIMAL-001",
          name: "Decimal Test",
          slug: "decimal-test",
          price: 123.45,
          compareAt: 199.99,
        },
      });

      expect(Number(product.price)).toBe(123.45);
      expect(Number(product.compareAt)).toBe(199.99);
    });

    it("should handle JSON metadata", async () => {
      const category = await prisma.category.create({
        data: { name: "Test", slug: "test-meta" },
      });

      const metadata = {
        color: "red",
        size: "large",
        features: ["waterproof", "wireless"],
      };

      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: "META-001",
          name: "Metadata Test",
          slug: "metadata-test",
          price: 100,
          metadata,
        },
      });

      expect(product.metadata).toEqual(metadata);
    });
  });

  describe("Order Transactions", () => {
    it("should create order with items in transaction", async () => {
      const user = await prisma.user.create({
        data: { email: "order@example.com", password: "password" },
      });

      const category = await prisma.category.create({
        data: { name: "Category", slug: "category" },
      });

      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: "ORDER-001",
          name: "Order Product",
          slug: "order-product",
          price: 50,
          stock: 100,
          status: "ACTIVE",
        },
      });

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderNumber: "ORD-001",
            userId: user.id,
            subtotal: 100,
            tax: 10,
            totalAmount: 110,
            shippingAddress: { city: "NYC" },
            billingAddress: { city: "NYC" },
            items: {
              create: [
                {
                  productId: product.id,
                  sku: product.sku,
                  name: product.name,
                  quantity: 2,
                  unitPrice: product.price,
                  subtotal: 100,
                },
              ],
            },
          },
          include: { items: true },
        });

        // Decrement stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: 2 } },
        });

        return newOrder;
      });

      expect(order.items.length).toBe(1);
      expect(order.items[0].quantity).toBe(2);

      // Verify stock was decremented
      const updatedProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(updatedProduct?.stock).toBe(98);
    });

    it("should rollback transaction on error", async () => {
      const user = await prisma.user.create({
        data: { email: "rollback@example.com", password: "password" },
      });

      const category = await prisma.category.create({
        data: { name: "Rollback", slug: "rollback" },
      });

      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: "ROLLBACK-001",
          name: "Rollback Product",
          slug: "rollback-product",
          price: 50,
          stock: 10,
          status: "ACTIVE",
        },
      });

      await expect(
        prisma.$transaction(async (tx) => {
          await tx.order.create({
            data: {
              orderNumber: "ORD-ROLLBACK",
              userId: user.id,
              subtotal: 50,
              tax: 5,
              totalAmount: 55,
              shippingAddress: {},
              billingAddress: {},
              items: {
                create: [
                  {
                    productId: product.id,
                    sku: product.sku,
                    name: product.name,
                    quantity: 1,
                    unitPrice: product.price,
                    subtotal: 50,
                  },
                ],
              },
            },
          });

          // Force an error
          throw new Error("Simulated error");
        })
      ).rejects.toThrow("Simulated error");

      // Verify order was not created
      const orders = await prisma.order.findMany({
        where: { orderNumber: "ORD-ROLLBACK" },
      });
      expect(orders.length).toBe(0);
    });
  });

  describe("Complex Queries", () => {
    it("should perform aggregations", async () => {
      const user = await prisma.user.create({
        data: { email: "agg@example.com", password: "password" },
      });

      const category = await prisma.category.create({
        data: { name: "Agg Category", slug: "agg-category" },
      });

      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: "AGG-001",
          name: "Agg Product",
          slug: "agg-product",
          price: 100,
          stock: 100,
          status: "ACTIVE",
        },
      });

      // Create multiple orders
      for (let i = 0; i < 3; i++) {
        await prisma.order.create({
          data: {
            orderNumber: `ORD-AGG-${i}`,
            userId: user.id,
            subtotal: 100,
            tax: 10,
            totalAmount: 110,
            status: i === 0 ? "PENDING" : "CONFIRMED",
            shippingAddress: {},
            billingAddress: {},
            items: {
              create: [
                {
                  productId: product.id,
                  sku: product.sku,
                  name: product.name,
                  quantity: 1,
                  unitPrice: 100,
                  subtotal: 100,
                },
              ],
            },
          },
        });
      }

      // Test aggregation
      const result = await prisma.order.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { totalAmount: true },
        _count: { id: true },
      });

      expect(result._count.id).toBe(2);
      expect(Number(result._sum.totalAmount)).toBe(220);
    });

    it("should perform groupBy", async () => {
      const user = await prisma.user.create({
        data: { email: "group@example.com", password: "password" },
      });

      const category = await prisma.category.create({
        data: { name: "Group Category", slug: "group-category" },
      });

      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: "GROUP-001",
          name: "Group Product",
          slug: "group-product",
          price: 50,
          stock: 100,
          status: "ACTIVE",
        },
      });

      // Create orders with different statuses
      const statuses = ["PENDING", "PENDING", "CONFIRMED", "SHIPPED", "SHIPPED", "SHIPPED"];
      for (let i = 0; i < statuses.length; i++) {
        await prisma.order.create({
          data: {
            orderNumber: `ORD-GROUP-${i}`,
            userId: user.id,
            subtotal: 50,
            tax: 5,
            totalAmount: 55,
            status: statuses[i] as any,
            shippingAddress: {},
            billingAddress: {},
            items: {
              create: [
                {
                  productId: product.id,
                  sku: product.sku,
                  name: product.name,
                  quantity: 1,
                  unitPrice: 50,
                  subtotal: 50,
                },
              ],
            },
          },
        });
      }

      const grouped = await prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      });

      expect(grouped.length).toBe(3);
      expect(grouped[0].status).toBe("SHIPPED");
      expect(grouped[0]._count.id).toBe(3);
    });

    it("should handle complex joins", async () => {
      const user = await prisma.user.create({
        data: { email: "join@example.com", password: "password" },
      });

      const category = await prisma.category.create({
        data: { name: "Join Category", slug: "join-category" },
      });

      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: "JOIN-001",
          name: "Join Product",
          slug: "join-product",
          price: 75,
          stock: 100,
          status: "ACTIVE",
        },
      });

      await prisma.order.create({
        data: {
          orderNumber: "ORD-JOIN",
          userId: user.id,
          subtotal: 75,
          tax: 7.5,
          totalAmount: 82.5,
          shippingAddress: {},
          billingAddress: {},
          items: {
            create: [
              {
                productId: product.id,
                sku: product.sku,
                name: product.name,
                quantity: 1,
                unitPrice: 75,
                subtotal: 75,
              },
            ],
          },
        },
      });

      // Complex query with multiple includes
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      expect(orders.length).toBe(1);
      expect(orders[0].user.email).toBe("join@example.com");
      expect(orders[0].items[0].product.category.name).toBe("Join Category");
    });
  });

  describe("Cascade Delete", () => {
    it("should cascade delete order items when order is deleted", async () => {
      const user = await prisma.user.create({
        data: { email: "cascade@example.com", password: "password" },
      });

      const category = await prisma.category.create({
        data: { name: "Cascade", slug: "cascade" },
      });

      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: "CASCADE-001",
          name: "Cascade Product",
          slug: "cascade-product",
          price: 100,
          stock: 100,
          status: "ACTIVE",
        },
      });

      const order = await prisma.order.create({
        data: {
          orderNumber: "ORD-CASCADE",
          userId: user.id,
          subtotal: 100,
          tax: 10,
          totalAmount: 110,
          shippingAddress: {},
          billingAddress: {},
          items: {
            create: [
              {
                productId: product.id,
                sku: product.sku,
                name: product.name,
                quantity: 1,
                unitPrice: 100,
                subtotal: 100,
              },
            ],
          },
        },
      });

      // Delete order
      await prisma.order.delete({
        where: { id: order.id },
      });

      // Verify items are deleted
      const items = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      });
      expect(items.length).toBe(0);
    });

    it("should cascade delete sessions when user is deleted", async () => {
      const user = await prisma.user.create({
        data: { email: "session-cascade@example.com", password: "password" },
      });

      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken: "token-123",
          expiresAt: new Date(Date.now() + 86400000),
        },
      });

      // Delete user
      await prisma.user.delete({
        where: { id: user.id },
      });

      // Verify sessions are deleted
      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      });
      expect(sessions.length).toBe(0);
    });
  });
});
