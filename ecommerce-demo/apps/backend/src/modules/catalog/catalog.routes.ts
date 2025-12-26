import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../../utils/prisma.js";
import { cache, cacheKeys } from "../../utils/redis.js";
import { adminGuard, optionalAuthGuard } from "../../middleware/auth-guard.js";
import { NotFoundError, BadRequestError } from "../../middleware/error-handler.js";
import { Prisma } from "@prisma/client";

// Schemas
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const productQuerySchema = paginationSchema.extend({
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

const updateCategorySchema = createCategorySchema.partial();

const createProductSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAt: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

const updateProductSchema = createProductSchema.partial();

export async function catalogRoutes(app: FastifyInstance): Promise<void> {
  // ========================================
  // Categories
  // ========================================

  // List categories
  app.get("/categories", async (request: FastifyRequest, reply: FastifyReply) => {
    // Try cache first
    const cached = await cache.get<unknown>(cacheKeys.categoryList());
    if (cached) {
      return reply.send({ success: true, data: cached });
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { products: true } },
      },
    });

    // Cache for 5 minutes
    await cache.set(cacheKeys.categoryList(), categories, 300);

    return reply.send({ success: true, data: categories });
  });

  // Get single category
  app.get(
    "/categories/:idOrSlug",
    async (request: FastifyRequest<{ Params: { idOrSlug: string } }>, reply: FastifyReply) => {
      const { idOrSlug } = request.params;

      const category = await prisma.category.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          isActive: true,
        },
        include: {
          parent: true,
          children: { where: { isActive: true } },
          _count: { select: { products: true } },
        },
      });

      if (!category) {
        throw new NotFoundError("Category not found");
      }

      return reply.send({ success: true, data: category });
    }
  );

  // Create category (admin only)
  app.post(
    "/categories",
    { preHandler: [adminGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createCategorySchema.parse(request.body);

      const category = await prisma.category.create({
        data: body as any,
      });

      // Invalidate cache
      await cache.del(cacheKeys.categoryList());

      return reply.status(201).send({ success: true, data: category });
    }
  );

  // Update category (admin only)
  app.patch(
    "/categories/:id",
    { preHandler: [adminGuard] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const body = updateCategorySchema.parse(request.body);

      const category = await prisma.category.update({
        where: { id },
        data: body,
      });

      // Invalidate cache
      await cache.del(cacheKeys.categoryList());
      await cache.del(cacheKeys.category(id));

      return reply.send({ success: true, data: category });
    }
  );

  // Delete category (admin only)
  app.delete(
    "/categories/:id",
    { preHandler: [adminGuard] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      // Check if category has products
      const productCount = await prisma.product.count({
        where: { categoryId: id },
      });

      if (productCount > 0) {
        throw new BadRequestError(
          `Cannot delete category with ${productCount} products. Move or delete products first.`
        );
      }

      await prisma.category.delete({ where: { id } });

      // Invalidate cache
      await cache.del(cacheKeys.categoryList());
      await cache.del(cacheKeys.category(id));

      return reply.send({ success: true, message: "Category deleted" });
    }
  );

  // ========================================
  // Products
  // ========================================

  // List products
  app.get(
    "/products",
    { preHandler: [optionalAuthGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = productQuerySchema.parse(request.query);
      const { page, limit, sortBy, sortOrder, ...filters } = query;

      const where: Prisma.ProductWhereInput = {
        status: request.userRole === "ADMIN" ? filters.status : "ACTIVE",
      };

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
        }
      }

      if (filters.featured !== undefined) {
        where.isFeatured = filters.featured;
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.product.count({ where }),
      ]);

      return reply.send({
        success: true,
        data: products,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  );

  // Get single product
  app.get(
    "/products/:idOrSlug",
    { preHandler: [optionalAuthGuard] },
    async (request: FastifyRequest<{ Params: { idOrSlug: string } }>, reply: FastifyReply) => {
      const { idOrSlug } = request.params;

      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }, { sku: idOrSlug }],
          ...(request.userRole !== "ADMIN" && { status: "ACTIVE" }),
        },
        include: {
          category: true,
        },
      });

      if (!product) {
        throw new NotFoundError("Product not found");
      }

      return reply.send({ success: true, data: product });
    }
  );

  // Create product (admin only)
  app.post(
    "/products",
    { preHandler: [adminGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createProductSchema.parse(request.body);

      // Verify category exists
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId },
      });

      if (!category) {
        throw new BadRequestError("Category not found");
      }

      const product = await prisma.product.create({
        data: {
          ...body,
          price: new Prisma.Decimal(body.price),
          compareAt: body.compareAt ? new Prisma.Decimal(body.compareAt) : null,
        } as any,
        include: { category: true },
      });

      return reply.status(201).send({ success: true, data: product });
    }
  );

  // Update product (admin only)
  app.patch(
    "/products/:id",
    { preHandler: [adminGuard] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const body = updateProductSchema.parse(request.body);

      // Verify category if updating
      if (body.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: body.categoryId },
        });

        if (!category) {
          throw new BadRequestError("Category not found");
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...body,
          price: body.price ? new Prisma.Decimal(body.price) : undefined,
          compareAt: body.compareAt ? new Prisma.Decimal(body.compareAt) : undefined,
        } as any,
        include: { category: true },
      });

      // Invalidate cache
      await cache.del(cacheKeys.product(id));

      return reply.send({ success: true, data: product });
    }
  );

  // Delete product (admin only)
  app.delete(
    "/products/:id",
    { preHandler: [adminGuard] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      // Check if product is in any orders
      const orderItemCount = await prisma.orderItem.count({
        where: { productId: id },
      });

      if (orderItemCount > 0) {
        // Soft delete - archive instead
        await prisma.product.update({
          where: { id },
          data: { status: "ARCHIVED" },
        });

        return reply.send({
          success: true,
          message: "Product archived (has order history)",
        });
      }

      await prisma.product.delete({ where: { id } });

      // Invalidate cache
      await cache.del(cacheKeys.product(id));

      return reply.send({ success: true, message: "Product deleted" });
    }
  );
}
