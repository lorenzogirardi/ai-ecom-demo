import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { createTestServer, getAuthToken, TestContext } from "../utils/test-server.js";
import { testData } from "../utils/factories.js";

describe("Orders Routes Integration", () => {
  let ctx: TestContext;
  let app: FastifyInstance;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    ctx = await createTestServer(prisma);
    app = ctx.app;
  });

  afterAll(async () => {
    await ctx.factory.cleanupAll();
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await ctx.factory.cleanupOrders();
  });

  describe("POST /api/orders", () => {
    it("should create order successfully", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const product = await ctx.factory.createProduct({ stock: 100 });

      const response = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          items: [{ productId: product.id, quantity: 2 }],
          shippingAddress: testData.validAddress,
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.orderNumber).toBeDefined();
      expect(body.data.status).toBe("PENDING");
      expect(body.data.items.length).toBe(1);
      expect(body.data.items[0].quantity).toBe(2);
      expect(Number(body.data.subtotal)).toBe(Number(product.price) * 2);
    });

    it("should calculate totals correctly", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const product1 = await ctx.factory.createProduct({ price: 100, stock: 50 });
      const product2 = await ctx.factory.createProduct({ price: 50, stock: 50 });

      const response = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          items: [
            { productId: product1.id, quantity: 2 }, // 200
            { productId: product2.id, quantity: 3 }, // 150
          ],
          shippingAddress: testData.validAddress,
        },
      });

      const body = JSON.parse(response.body);
      expect(Number(body.data.subtotal)).toBe(350);
      expect(Number(body.data.tax)).toBe(35); // 10% tax
      expect(Number(body.data.totalAmount)).toBe(385);
    });

    it("should decrement product stock", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const product = await ctx.factory.createProduct({ stock: 100 });

      await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          items: [{ productId: product.id, quantity: 5 }],
          shippingAddress: testData.validAddress,
        },
      });

      const updatedProduct = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(updatedProduct?.stock).toBe(95);
    });

    it("should return 400 for insufficient stock", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const product = await ctx.factory.createProduct({ stock: 5 });

      const response = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          items: [{ productId: product.id, quantity: 10 }],
          shippingAddress: testData.validAddress,
        },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error.message).toContain("Insufficient stock");
    });

    it("should return 400 for inactive product", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const product = await ctx.factory.createProduct({ status: "DRAFT", stock: 100 });

      const response = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          items: [{ productId: product.id, quantity: 1 }],
          shippingAddress: testData.validAddress,
        },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error.message).toContain("not available");
    });

    it("should return 422 for empty items array", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      const response = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          items: [],
          shippingAddress: testData.validAddress,
        },
      });

      expect(response.statusCode).toBe(422);
    });

    it("should return 401 without authentication", async () => {
      const product = await ctx.factory.createProduct();

      const response = await app.inject({
        method: "POST",
        url: "/api/orders",
        payload: {
          items: [{ productId: product.id, quantity: 1 }],
          shippingAddress: testData.validAddress,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should use shipping address as billing if not provided", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const product = await ctx.factory.createProduct({ stock: 100 });

      const response = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
        payload: {
          items: [{ productId: product.id, quantity: 1 }],
          shippingAddress: testData.validAddress,
        },
      });

      const body = JSON.parse(response.body);
      expect(body.data.billingAddress).toEqual(body.data.shippingAddress);
    });
  });

  describe("GET /api/orders", () => {
    it("should return user orders", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      await ctx.factory.createOrder({ userId: user.id });
      await ctx.factory.createOrder({ userId: user.id });

      const response = await app.inject({
        method: "GET",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.length).toBe(2);
      expect(body.meta.total).toBe(2);
    });

    it("should not return other users orders", async () => {
      const user1 = await ctx.factory.createUser();
      const user2 = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user1.id, role: user1.role });

      await ctx.factory.createOrder({ userId: user1.id });
      await ctx.factory.createOrder({ userId: user2.id });

      const response = await app.inject({
        method: "GET",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = JSON.parse(response.body);
      expect(body.data.length).toBe(1);
    });

    it("should filter by status", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      await ctx.factory.createOrder({ userId: user.id, status: "PENDING" });
      await ctx.factory.createOrder({ userId: user.id, status: "CONFIRMED" });

      const response = await app.inject({
        method: "GET",
        url: "/api/orders?status=PENDING",
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = JSON.parse(response.body);
      expect(body.data.length).toBe(1);
      expect(body.data[0].status).toBe("PENDING");
    });

    it("should paginate results", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      for (let i = 0; i < 5; i++) {
        await ctx.factory.createOrder({ userId: user.id });
      }

      const response = await app.inject({
        method: "GET",
        url: "/api/orders?page=1&limit=2",
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = JSON.parse(response.body);
      expect(body.data.length).toBe(2);
      expect(body.meta.total).toBe(5);
      expect(body.meta.totalPages).toBe(3);
    });

    it("should include order items", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      await ctx.factory.createOrder({ userId: user.id });

      const response = await app.inject({
        method: "GET",
        url: "/api/orders",
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = JSON.parse(response.body);
      expect(body.data[0].items).toBeDefined();
      expect(body.data[0].items.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should return order by ID", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const order = await ctx.factory.createOrder({ userId: user.id });

      const response = await app.inject({
        method: "GET",
        url: `/api/orders/${order.id}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(order.id);
      expect(body.data.items).toBeDefined();
      expect(body.data.user).toBeDefined();
    });

    it("should return order by order number", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const order = await ctx.factory.createOrder({ userId: user.id });

      const response = await app.inject({
        method: "GET",
        url: `/api/orders/${order.orderNumber}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.orderNumber).toBe(order.orderNumber);
    });

    it("should return 404 for non-existent order", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });

      const response = await app.inject({
        method: "GET",
        url: "/api/orders/nonexistent-id",
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 404 for other users order", async () => {
      const user1 = await ctx.factory.createUser();
      const user2 = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user1.id, role: user1.role });
      const order = await ctx.factory.createOrder({ userId: user2.id });

      const response = await app.inject({
        method: "GET",
        url: `/api/orders/${order.id}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should allow admin to view any order", async () => {
      const user = await ctx.factory.createUser();
      const admin = await ctx.factory.createAdmin();
      const token = await getAuthToken(app, { id: admin.id, role: admin.role });
      const order = await ctx.factory.createOrder({ userId: user.id });

      const response = await app.inject({
        method: "GET",
        url: `/api/orders/${order.id}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("POST /api/orders/:id/cancel", () => {
    it("should cancel pending order", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const order = await ctx.factory.createOrder({
        userId: user.id,
        status: "PENDING",
      });

      const response = await app.inject({
        method: "POST",
        url: `/api/orders/${order.id}/cancel`,
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message).toContain("cancelled");

      // Verify order is cancelled
      const cancelled = await prisma.order.findUnique({
        where: { id: order.id },
      });
      expect(cancelled?.status).toBe("CANCELLED");
    });

    it("should restore stock when cancelled", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const product = await ctx.factory.createProduct({ stock: 100 });
      const order = await ctx.factory.createOrder({
        userId: user.id,
        status: "PENDING",
        items: [{ productId: product.id, quantity: 5 }],
      });

      // Stock was decremented during order creation
      const beforeCancel = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(beforeCancel?.stock).toBe(95);

      await app.inject({
        method: "POST",
        url: `/api/orders/${order.id}/cancel`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const afterCancel = await prisma.product.findUnique({
        where: { id: product.id },
      });
      expect(afterCancel?.stock).toBe(100);
    });

    it("should return 400 for non-cancellable status", async () => {
      const user = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user.id, role: user.role });
      const order = await ctx.factory.createOrder({
        userId: user.id,
        status: "SHIPPED",
      });

      const response = await app.inject({
        method: "POST",
        url: `/api/orders/${order.id}/cancel`,
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error.message).toContain("Cannot cancel");
    });

    it("should return 404 for other users order", async () => {
      const user1 = await ctx.factory.createUser();
      const user2 = await ctx.factory.createUser();
      const token = await getAuthToken(app, { id: user1.id, role: user1.role });
      const order = await ctx.factory.createOrder({ userId: user2.id });

      const response = await app.inject({
        method: "POST",
        url: `/api/orders/${order.id}/cancel`,
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("Admin Routes", () => {
    describe("GET /api/orders/admin/all", () => {
      it("should return all orders for admin", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });

        const user1 = await ctx.factory.createUser();
        const user2 = await ctx.factory.createUser();
        await ctx.factory.createOrder({ userId: user1.id });
        await ctx.factory.createOrder({ userId: user2.id });

        const response = await app.inject({
          method: "GET",
          url: "/api/orders/admin/all",
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.length).toBe(2);
      });

      it("should return 403 for non-admin", async () => {
        const user = await ctx.factory.createUser();
        const token = await getAuthToken(app, { id: user.id, role: user.role });

        const response = await app.inject({
          method: "GET",
          url: "/api/orders/admin/all",
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.statusCode).toBe(403);
      });
    });

    describe("PATCH /api/orders/:id/status", () => {
      it("should update order status as admin", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const user = await ctx.factory.createUser();
        const order = await ctx.factory.createOrder({
          userId: user.id,
          status: "PENDING",
        });

        const response = await app.inject({
          method: "PATCH",
          url: `/api/orders/${order.id}/status`,
          headers: { Authorization: `Bearer ${token}` },
          payload: { status: "CONFIRMED" },
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.status).toBe("CONFIRMED");
        expect(body.data.paidAt).toBeDefined();
      });

      it("should set timestamp based on status", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const user = await ctx.factory.createUser();
        const order = await ctx.factory.createOrder({ userId: user.id });

        // Update to SHIPPED
        const response = await app.inject({
          method: "PATCH",
          url: `/api/orders/${order.id}/status`,
          headers: { Authorization: `Bearer ${token}` },
          payload: { status: "SHIPPED" },
        });

        const body = JSON.parse(response.body);
        expect(body.data.shippedAt).toBeDefined();
      });

      it("should return 403 for non-admin", async () => {
        const user = await ctx.factory.createUser();
        const token = await getAuthToken(app, { id: user.id, role: user.role });
        const order = await ctx.factory.createOrder({ userId: user.id });

        const response = await app.inject({
          method: "PATCH",
          url: `/api/orders/${order.id}/status`,
          headers: { Authorization: `Bearer ${token}` },
          payload: { status: "CONFIRMED" },
        });

        expect(response.statusCode).toBe(403);
      });

      it("should return 404 for non-existent order", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });

        const response = await app.inject({
          method: "PATCH",
          url: "/api/orders/nonexistent-id/status",
          headers: { Authorization: `Bearer ${token}` },
          payload: { status: "CONFIRMED" },
        });

        expect(response.statusCode).toBe(404);
      });
    });

    describe("GET /api/orders/admin/stats", () => {
      it("should return order statistics", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });

        const user = await ctx.factory.createUser();
        await ctx.factory.createOrder({ userId: user.id, status: "PENDING" });
        await ctx.factory.createOrder({ userId: user.id, status: "CONFIRMED" });
        await ctx.factory.createOrder({ userId: user.id, status: "DELIVERED" });

        const response = await app.inject({
          method: "GET",
          url: "/api/orders/admin/stats",
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.totalOrders).toBe(3);
        expect(body.data.ordersByStatus).toBeDefined();
        expect(body.data.last30Days).toBeDefined();
      });

      it("should return 403 for non-admin", async () => {
        const user = await ctx.factory.createUser();
        const token = await getAuthToken(app, { id: user.id, role: user.role });

        const response = await app.inject({
          method: "GET",
          url: "/api/orders/admin/stats",
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.statusCode).toBe(403);
      });
    });
  });
});
