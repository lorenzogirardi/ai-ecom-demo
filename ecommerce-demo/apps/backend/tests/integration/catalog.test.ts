import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { createTestServer, getAuthToken, TestContext } from "../utils/test-server.js";
import { testData } from "../utils/factories.js";

describe("Catalog Routes Integration", () => {
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
    await ctx.factory.cleanupProducts();
  });

  describe("Categories", () => {
    describe("GET /api/catalog/categories", () => {
      it("should return empty array when no categories", async () => {
        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/categories",
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual([]);
      });

      it("should return list of active categories", async () => {
        await ctx.factory.createCategory({ name: "Category 1" });
        await ctx.factory.createCategory({ name: "Category 2" });
        await ctx.factory.createCategory({ name: "Inactive", isActive: false });

        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/categories",
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.length).toBe(2);
        expect(body.data.every((c: any) => c.isActive)).toBe(true);
      });

      it("should include product count", async () => {
        const category = await ctx.factory.createCategory();
        await ctx.factory.createProduct({ categoryId: category.id });
        await ctx.factory.createProduct({ categoryId: category.id });

        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/categories",
        });

        const body = JSON.parse(response.body);
        const cat = body.data.find((c: any) => c.id === category.id);
        expect(cat._count.products).toBe(2);
      });
    });

    describe("GET /api/catalog/categories/:idOrSlug", () => {
      it("should return category by ID", async () => {
        const category = await ctx.factory.createCategory();

        const response = await app.inject({
          method: "GET",
          url: `/api/catalog/categories/${category.id}`,
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.id).toBe(category.id);
        expect(body.data.name).toBe(category.name);
      });

      it("should return category by slug", async () => {
        const category = await ctx.factory.createCategory();

        const response = await app.inject({
          method: "GET",
          url: `/api/catalog/categories/${category.slug}`,
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.slug).toBe(category.slug);
      });

      it("should return 404 for non-existent category", async () => {
        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/categories/nonexistent-id",
        });

        expect(response.statusCode).toBe(404);

        const body = JSON.parse(response.body);
        expect(body.error.code).toBe("NOT_FOUND");
      });

      it("should include parent and children relationships", async () => {
        const parent = await ctx.factory.createCategory({ name: "Parent" });
        const child = await ctx.factory.createCategory({
          name: "Child",
          parentId: parent.id,
        });

        const response = await app.inject({
          method: "GET",
          url: `/api/catalog/categories/${parent.id}`,
        });

        const body = JSON.parse(response.body);
        expect(body.data.children.length).toBe(1);
        expect(body.data.children[0].id).toBe(child.id);
      });
    });

    describe("POST /api/catalog/categories (Admin)", () => {
      it("should create category as admin", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });

        const response = await app.inject({
          method: "POST",
          url: "/api/catalog/categories",
          headers: { Authorization: `Bearer ${token}` },
          payload: testData.validCategory,
        });

        expect(response.statusCode).toBe(201);

        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.name).toBe(testData.validCategory.name);
        expect(body.data.slug).toBe(testData.validCategory.slug);
      });

      it("should return 403 for non-admin", async () => {
        const user = await ctx.factory.createUser();
        const token = await getAuthToken(app, { id: user.id, role: user.role });

        const response = await app.inject({
          method: "POST",
          url: "/api/catalog/categories",
          headers: { Authorization: `Bearer ${token}` },
          payload: testData.validCategory,
        });

        expect(response.statusCode).toBe(403);
      });

      it("should return 401 without auth", async () => {
        const response = await app.inject({
          method: "POST",
          url: "/api/catalog/categories",
          payload: testData.validCategory,
        });

        expect(response.statusCode).toBe(401);
      });
    });

    describe("PATCH /api/catalog/categories/:id (Admin)", () => {
      it("should update category as admin", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const category = await ctx.factory.createCategory();

        const response = await app.inject({
          method: "PATCH",
          url: `/api/catalog/categories/${category.id}`,
          headers: { Authorization: `Bearer ${token}` },
          payload: { name: "Updated Name" },
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.name).toBe("Updated Name");
      });

      it("should return 403 for non-admin", async () => {
        const user = await ctx.factory.createUser();
        const token = await getAuthToken(app, { id: user.id, role: user.role });
        const category = await ctx.factory.createCategory();

        const response = await app.inject({
          method: "PATCH",
          url: `/api/catalog/categories/${category.id}`,
          headers: { Authorization: `Bearer ${token}` },
          payload: { name: "Updated" },
        });

        expect(response.statusCode).toBe(403);
      });
    });

    describe("DELETE /api/catalog/categories/:id (Admin)", () => {
      it("should delete category without products", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const category = await ctx.factory.createCategory();

        const response = await app.inject({
          method: "DELETE",
          url: `/api/catalog/categories/${category.id}`,
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.message).toContain("deleted");
      });

      it("should return 400 if category has products", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const category = await ctx.factory.createCategory();
        await ctx.factory.createProduct({ categoryId: category.id });

        const response = await app.inject({
          method: "DELETE",
          url: `/api/catalog/categories/${category.id}`,
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.statusCode).toBe(400);

        const body = JSON.parse(response.body);
        expect(body.error.message).toContain("products");
      });
    });
  });

  describe("Products", () => {
    describe("GET /api/catalog/products", () => {
      it("should return paginated products", async () => {
        const category = await ctx.factory.createCategory();
        for (let i = 0; i < 5; i++) {
          await ctx.factory.createProduct({ categoryId: category.id });
        }

        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/products?page=1&limit=3",
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.length).toBe(3);
        expect(body.meta.page).toBe(1);
        expect(body.meta.limit).toBe(3);
        expect(body.meta.total).toBe(5);
        expect(body.meta.totalPages).toBe(2);
      });

      it("should filter by category", async () => {
        const cat1 = await ctx.factory.createCategory();
        const cat2 = await ctx.factory.createCategory();
        await ctx.factory.createProduct({ categoryId: cat1.id });
        await ctx.factory.createProduct({ categoryId: cat1.id });
        await ctx.factory.createProduct({ categoryId: cat2.id });

        const response = await app.inject({
          method: "GET",
          url: `/api/catalog/products?categoryId=${cat1.id}`,
        });

        const body = JSON.parse(response.body);
        expect(body.data.length).toBe(2);
        expect(body.data.every((p: any) => p.categoryId === cat1.id)).toBe(true);
      });

      it("should filter by price range", async () => {
        const category = await ctx.factory.createCategory();
        await ctx.factory.createProduct({ categoryId: category.id, price: 10 });
        await ctx.factory.createProduct({ categoryId: category.id, price: 50 });
        await ctx.factory.createProduct({ categoryId: category.id, price: 100 });

        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/products?minPrice=20&maxPrice=80",
        });

        const body = JSON.parse(response.body);
        expect(body.data.length).toBe(1);
        expect(Number(body.data[0].price)).toBe(50);
      });

      it("should filter by featured", async () => {
        const category = await ctx.factory.createCategory();
        await ctx.factory.createProduct({ categoryId: category.id, isFeatured: true });
        await ctx.factory.createProduct({ categoryId: category.id, isFeatured: false });

        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/products?featured=true",
        });

        const body = JSON.parse(response.body);
        expect(body.data.length).toBe(1);
        expect(body.data[0].isFeatured).toBe(true);
      });

      it("should only show ACTIVE products for non-admins", async () => {
        const category = await ctx.factory.createCategory();
        await ctx.factory.createProduct({ categoryId: category.id, status: "ACTIVE" });
        await ctx.factory.createProduct({ categoryId: category.id, status: "DRAFT" });
        await ctx.factory.createProduct({ categoryId: category.id, status: "ARCHIVED" });

        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/products",
        });

        const body = JSON.parse(response.body);
        expect(body.data.length).toBe(1);
        expect(body.data[0].status).toBe("ACTIVE");
      });

      it("should sort products", async () => {
        const category = await ctx.factory.createCategory();
        await ctx.factory.createProduct({ categoryId: category.id, name: "Zebra", price: 10 });
        await ctx.factory.createProduct({ categoryId: category.id, name: "Apple", price: 50 });

        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/products?sortBy=name&sortOrder=asc",
        });

        const body = JSON.parse(response.body);
        expect(body.data[0].name).toBe("Apple");
        expect(body.data[1].name).toBe("Zebra");
      });
    });

    describe("GET /api/catalog/products/:idOrSlug", () => {
      it("should return product by ID", async () => {
        const product = await ctx.factory.createProduct();

        const response = await app.inject({
          method: "GET",
          url: `/api/catalog/products/${product.id}`,
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.id).toBe(product.id);
        expect(body.data.category).toBeDefined();
      });

      it("should return product by slug", async () => {
        const product = await ctx.factory.createProduct();

        const response = await app.inject({
          method: "GET",
          url: `/api/catalog/products/${product.slug}`,
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.slug).toBe(product.slug);
      });

      it("should return product by SKU", async () => {
        const product = await ctx.factory.createProduct();

        const response = await app.inject({
          method: "GET",
          url: `/api/catalog/products/${product.sku}`,
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.sku).toBe(product.sku);
      });

      it("should return 404 for non-existent product", async () => {
        const response = await app.inject({
          method: "GET",
          url: "/api/catalog/products/nonexistent",
        });

        expect(response.statusCode).toBe(404);
      });

      it("should return 404 for DRAFT product without admin", async () => {
        const product = await ctx.factory.createProduct({ status: "DRAFT" });

        const response = await app.inject({
          method: "GET",
          url: `/api/catalog/products/${product.id}`,
        });

        expect(response.statusCode).toBe(404);
      });
    });

    describe("POST /api/catalog/products (Admin)", () => {
      it("should create product as admin", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const category = await ctx.factory.createCategory();

        const response = await app.inject({
          method: "POST",
          url: "/api/catalog/products",
          headers: { Authorization: `Bearer ${token}` },
          payload: {
            ...testData.validProduct,
            categoryId: category.id,
          },
        });

        expect(response.statusCode).toBe(201);

        const body = JSON.parse(response.body);
        expect(body.data.name).toBe(testData.validProduct.name);
        expect(body.data.sku).toBe(testData.validProduct.sku);
        expect(body.data.category.id).toBe(category.id);
      });

      it("should return 400 for invalid category", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });

        const response = await app.inject({
          method: "POST",
          url: "/api/catalog/products",
          headers: { Authorization: `Bearer ${token}` },
          payload: {
            ...testData.validProduct,
            categoryId: "nonexistent-id",
          },
        });

        expect(response.statusCode).toBe(400);
      });

      it("should return 422 for missing required fields", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });

        const response = await app.inject({
          method: "POST",
          url: "/api/catalog/products",
          headers: { Authorization: `Bearer ${token}` },
          payload: { name: "Missing fields" },
        });

        expect(response.statusCode).toBe(422);
      });
    });

    describe("PATCH /api/catalog/products/:id (Admin)", () => {
      it("should update product as admin", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const product = await ctx.factory.createProduct();

        const response = await app.inject({
          method: "PATCH",
          url: `/api/catalog/products/${product.id}`,
          headers: { Authorization: `Bearer ${token}` },
          payload: {
            name: "Updated Product",
            price: 149.99,
          },
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.name).toBe("Updated Product");
        expect(Number(body.data.price)).toBe(149.99);
      });

      it("should update product status", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const product = await ctx.factory.createProduct({ status: "DRAFT" });

        const response = await app.inject({
          method: "PATCH",
          url: `/api/catalog/products/${product.id}`,
          headers: { Authorization: `Bearer ${token}` },
          payload: { status: "ACTIVE" },
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.data.status).toBe("ACTIVE");
      });
    });

    describe("DELETE /api/catalog/products/:id (Admin)", () => {
      it("should delete product without orders", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const product = await ctx.factory.createProduct();

        const response = await app.inject({
          method: "DELETE",
          url: `/api/catalog/products/${product.id}`,
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.message).toContain("deleted");
      });

      it("should archive product with order history", async () => {
        const admin = await ctx.factory.createAdmin();
        const token = await getAuthToken(app, { id: admin.id, role: admin.role });
        const product = await ctx.factory.createProduct();

        // Create an order with this product
        const user = await ctx.factory.createUser();
        await ctx.factory.createOrder({
          userId: user.id,
          items: [{ productId: product.id, quantity: 1 }],
        });

        const response = await app.inject({
          method: "DELETE",
          url: `/api/catalog/products/${product.id}`,
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body);
        expect(body.message).toContain("archived");

        // Verify product is archived, not deleted
        const archived = await prisma.product.findUnique({
          where: { id: product.id },
        });
        expect(archived?.status).toBe("ARCHIVED");
      });
    });
  });
});
