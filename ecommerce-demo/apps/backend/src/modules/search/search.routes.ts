import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../../utils/prisma.js";
import { cache } from "../../utils/redis.js";
import { Prisma } from "@prisma/client";

// Schemas
const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  type: z.enum(["all", "products", "categories"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

const suggestQuerySchema = z.object({
  q: z.string().min(2, "Query must be at least 2 characters"),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export async function searchRoutes(app: FastifyInstance): Promise<void> {
  // Full-text search
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = searchQuerySchema.parse(request.query);
    const { q, type, page, limit, categoryId, minPrice, maxPrice } = query;

    const searchTerm = q.toLowerCase().trim();
    const cacheKey = `search:${searchTerm}:${type}:${page}:${limit}:${categoryId || ""}:${minPrice || ""}:${maxPrice || ""}`;

    // Check cache
    const cached = await cache.get<unknown>(cacheKey);
    if (cached) {
      return reply.send({ success: true, ...cached });
    }

    const results: {
      products?: unknown[];
      categories?: unknown[];
      meta: {
        query: string;
        page: number;
        limit: number;
        totalProducts?: number;
        totalCategories?: number;
      };
    } = {
      meta: { query: q, page, limit },
    };

    // Search products
    if (type === "all" || type === "products") {
      const productWhere: Prisma.ProductWhereInput = {
        status: "ACTIVE",
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { sku: { contains: searchTerm, mode: "insensitive" } },
        ],
      };

      if (categoryId) {
        productWhere.categoryId = categoryId;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        productWhere.price = {};
        if (minPrice !== undefined) {
          productWhere.price.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          productWhere.price.lte = maxPrice;
        }
      }

      const [products, totalProducts] = await Promise.all([
        prisma.product.findMany({
          where: productWhere,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.product.count({ where: productWhere }),
      ]);

      results.products = products;
      results.meta.totalProducts = totalProducts;
    }

    // Search categories
    if (type === "all" || type === "categories") {
      const categoryWhere: Prisma.CategoryWhereInput = {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      };

      const [categories, totalCategories] = await Promise.all([
        prisma.category.findMany({
          where: categoryWhere,
          skip: type === "categories" ? (page - 1) * limit : 0,
          take: type === "categories" ? limit : 5,
          orderBy: { name: "asc" },
          include: {
            _count: { select: { products: true } },
          },
        }),
        prisma.category.count({ where: categoryWhere }),
      ]);

      results.categories = categories;
      results.meta.totalCategories = totalCategories;
    }

    // Cache for 2 minutes
    await cache.set(cacheKey, results, 120);

    return reply.send({ success: true, ...results });
  });

  // Autocomplete suggestions
  app.get("/suggest", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = suggestQuerySchema.parse(request.query);
    const { q, limit } = query;

    const searchTerm = q.toLowerCase().trim();
    const cacheKey = `suggest:${searchTerm}:${limit}`;

    // Check cache
    const cached = await cache.get<unknown>(cacheKey);
    if (cached) {
      return reply.send({ success: true, data: cached });
    }

    // Get product suggestions
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { startsWith: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        price: true,
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    });

    // Get category suggestions
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        name: { contains: searchTerm, mode: "insensitive" },
      },
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const suggestions = {
      products,
      categories,
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, suggestions, 300);

    return reply.send({ success: true, data: suggestions });
  });

  // Popular searches (could be based on analytics)
  app.get("/popular", async (request: FastifyRequest, reply: FastifyReply) => {
    const cacheKey = "search:popular";

    const cached = await cache.get<unknown>(cacheKey);
    if (cached) {
      return reply.send({ success: true, data: cached });
    }

    // For demo, return featured products and top categories
    const [featuredProducts, topCategories] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        take: 6,
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          price: true,
        },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        take: 6,
        orderBy: { products: { _count: "desc" } },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: true } },
        },
      }),
    ]);

    const popular = {
      featuredProducts,
      topCategories,
    };

    // Cache for 10 minutes
    await cache.set(cacheKey, popular, 600);

    return reply.send({ success: true, data: popular });
  });
}
