import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { createTestServer, TestContext } from "../utils/test-server.js";

describe("Search Routes Integration", () => {
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

  describe("GET /api/search", () => {
    it("should search products by name", async () => {
      const category = await ctx.factory.createCategory();
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Apple iPhone",
        status: "ACTIVE",
      });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Samsung Galaxy",
        status: "ACTIVE",
      });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Apple MacBook",
        status: "ACTIVE",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/search?q=apple",
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.products.length).toBe(2);
      expect(body.products.every((p: any) =>
        p.name.toLowerCase().includes("apple")
      )).toBe(true);
    });

    it("should search categories", async () => {
      // Note: "Electronics" does NOT contain "electric" (electr-on-ics vs electr-ic)
      await ctx.factory.createCategory({ name: "Electric Guitars" });
      await ctx.factory.createCategory({ name: "Electrical Items" });
      await ctx.factory.createCategory({ name: "Books" });

      const response = await app.inject({
        method: "GET",
        url: "/api/search?q=electric&type=categories",
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.categories.length).toBe(2);

      // Verify both electric categories are found
      const categoryNames = body.categories.map((c: any) => c.name);
      expect(categoryNames).toContain("Electric Guitars");
      expect(categoryNames).toContain("Electrical Items");
      expect(categoryNames).not.toContain("Books");
    });

    it("should search all types by default", async () => {
      const category = await ctx.factory.createCategory({ name: "Test Category" });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Test Product",
        status: "ACTIVE",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/search?q=test",
      });

      const body = JSON.parse(response.body);
      expect(body.products).toBeDefined();
      expect(body.categories).toBeDefined();
    });

    it("should paginate results", async () => {
      const category = await ctx.factory.createCategory();
      for (let i = 0; i < 25; i++) {
        await ctx.factory.createProduct({
          categoryId: category.id,
          name: `Product ${i}`,
          status: "ACTIVE",
        });
      }

      const response = await app.inject({
        method: "GET",
        url: "/api/search?q=product&page=1&limit=10",
      });

      const body = JSON.parse(response.body);
      expect(body.products.length).toBe(10);
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(10);
      expect(body.meta.totalProducts).toBe(25);
    });

    it("should filter by category", async () => {
      const cat1 = await ctx.factory.createCategory({ name: "Category 1" });
      const cat2 = await ctx.factory.createCategory({ name: "Category 2" });
      await ctx.factory.createProduct({
        categoryId: cat1.id,
        name: "Product A",
        status: "ACTIVE",
      });
      await ctx.factory.createProduct({
        categoryId: cat2.id,
        name: "Product B",
        status: "ACTIVE",
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/search?q=product&categoryId=${cat1.id}`,
      });

      const body = JSON.parse(response.body);
      expect(body.products.length).toBe(1);
      expect(body.products[0].category.id).toBe(cat1.id);
    });

    it("should filter by price range", async () => {
      const category = await ctx.factory.createCategory();
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Cheap Item",
        price: 10,
        status: "ACTIVE",
      });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Mid Item",
        price: 50,
        status: "ACTIVE",
      });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Expensive Item",
        price: 200,
        status: "ACTIVE",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/search?q=item&minPrice=25&maxPrice=100",
      });

      const body = JSON.parse(response.body);
      expect(body.products.length).toBe(1);
      expect(body.products[0].name).toBe("Mid Item");
    });

    it("should return 422 for missing query", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/search",
      });

      expect(response.statusCode).toBe(422);
    });

    it("should search in product description", async () => {
      const category = await ctx.factory.createCategory();
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Some Product",
        description: "This product has special features",
        status: "ACTIVE",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/search?q=special",
      });

      const body = JSON.parse(response.body);
      expect(body.products.length).toBe(1);
    });

    it("should search by SKU", async () => {
      const category = await ctx.factory.createCategory();
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Product",
        sku: "SKU-12345",
        status: "ACTIVE",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/search?q=SKU-12345",
      });

      const body = JSON.parse(response.body);
      expect(body.products.length).toBe(1);
    });

    it("should only search active products", async () => {
      const category = await ctx.factory.createCategory();
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Active Product",
        status: "ACTIVE",
      });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Draft Product",
        status: "DRAFT",
      });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Archived Product",
        status: "ARCHIVED",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/search?q=product",
      });

      const body = JSON.parse(response.body);
      expect(body.products.length).toBe(1);
      expect(body.products[0].status).toBe("ACTIVE");
    });
  });

  describe("GET /api/search/suggest", () => {
    it("should return product suggestions", async () => {
      const category = await ctx.factory.createCategory();
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "iPhone 15 Pro",
        status: "ACTIVE",
      });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "iPhone 14",
        status: "ACTIVE",
      });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "iPad Pro",
        status: "ACTIVE",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/search/suggest?q=iph",
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.products.length).toBe(2);
    });

    it("should return category suggestions", async () => {
      await ctx.factory.createCategory({ name: "Electronics" });
      await ctx.factory.createCategory({ name: "Clothing" });

      const response = await app.inject({
        method: "GET",
        url: "/api/search/suggest?q=elec",
      });

      const body = JSON.parse(response.body);
      expect(body.data.categories.length).toBe(1);
      expect(body.data.categories[0].name).toBe("Electronics");
    });

    it("should limit suggestions", async () => {
      const category = await ctx.factory.createCategory();
      for (let i = 0; i < 10; i++) {
        await ctx.factory.createProduct({
          categoryId: category.id,
          name: `Product ${i}`,
          status: "ACTIVE",
        });
      }

      const response = await app.inject({
        method: "GET",
        url: "/api/search/suggest?q=product&limit=3",
      });

      const body = JSON.parse(response.body);
      expect(body.data.products.length).toBe(3);
    });

    it("should return 422 for short query", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/search/suggest?q=a",
      });

      expect(response.statusCode).toBe(422);
    });

    it("should include basic product info", async () => {
      const category = await ctx.factory.createCategory();
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Test Product",
        price: 99.99,
        imageUrl: "https://example.com/image.jpg",
        status: "ACTIVE",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/search/suggest?q=test",
      });

      const body = JSON.parse(response.body);
      const product = body.data.products[0];
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.slug).toBeDefined();
      expect(product.price).toBeDefined();
    });
  });

  describe("GET /api/search/popular", () => {
    it("should return featured products", async () => {
      const category = await ctx.factory.createCategory();
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Featured Product",
        isFeatured: true,
        status: "ACTIVE",
      });
      await ctx.factory.createProduct({
        categoryId: category.id,
        name: "Regular Product",
        isFeatured: false,
        status: "ACTIVE",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/search/popular",
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.featuredProducts.length).toBe(1);
      expect(body.data.featuredProducts[0].name).toBe("Featured Product");
    });

    it("should return top categories", async () => {
      const cat1 = await ctx.factory.createCategory({ name: "Popular" });
      const cat2 = await ctx.factory.createCategory({ name: "Less Popular" });

      // Add more products to cat1
      await ctx.factory.createProduct({ categoryId: cat1.id, status: "ACTIVE" });
      await ctx.factory.createProduct({ categoryId: cat1.id, status: "ACTIVE" });
      await ctx.factory.createProduct({ categoryId: cat1.id, status: "ACTIVE" });
      await ctx.factory.createProduct({ categoryId: cat2.id, status: "ACTIVE" });

      const response = await app.inject({
        method: "GET",
        url: "/api/search/popular",
      });

      const body = JSON.parse(response.body);
      expect(body.data.topCategories).toBeDefined();
      expect(body.data.topCategories[0].name).toBe("Popular");
      expect(body.data.topCategories[0]._count.products).toBe(3);
    });

    it("should limit results", async () => {
      const category = await ctx.factory.createCategory();
      for (let i = 0; i < 10; i++) {
        await ctx.factory.createProduct({
          categoryId: category.id,
          isFeatured: true,
          status: "ACTIVE",
        });
      }

      const response = await app.inject({
        method: "GET",
        url: "/api/search/popular",
      });

      const body = JSON.parse(response.body);
      expect(body.data.featuredProducts.length).toBeLessThanOrEqual(6);
      expect(body.data.topCategories.length).toBeLessThanOrEqual(6);
    });
  });
});
