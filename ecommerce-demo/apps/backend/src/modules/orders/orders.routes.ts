import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../../utils/prisma.js";
import { authGuard, adminGuard } from "../../middleware/auth-guard.js";
import { NotFoundError, BadRequestError } from "../../middleware/error-handler.js";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";

// Schemas
const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(2).max(2),
  phone: z.string().optional(),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  notes: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  notes: z.string().optional(),
});

const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function ordersRoutes(app: FastifyInstance): Promise<void> {
  // Create order
  app.post(
    "/",
    { preHandler: [authGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createOrderSchema.parse(request.body);
      const userId = request.userId!;

      // Validate products and calculate totals
      const productIds = body.items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          status: "ACTIVE",
        },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestError("One or more products are not available");
      }

      // Check stock and calculate totals
      let subtotal = new Prisma.Decimal(0);
      const orderItems: {
        productId: string;
        sku: string;
        name: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
        subtotal: Prisma.Decimal;
      }[] = [];

      for (const item of body.items) {
        const product = products.find((p) => p.id === item.productId)!;

        if (product.stock < item.quantity) {
          throw new BadRequestError(
            `Insufficient stock for ${product.name}. Available: ${product.stock}`
          );
        }

        const itemSubtotal = product.price.mul(item.quantity);
        subtotal = subtotal.add(itemSubtotal);

        orderItems.push({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: itemSubtotal,
        });
      }

      // Calculate tax and total (simplified - 10% tax)
      const taxRate = new Prisma.Decimal(0.1);
      const tax = subtotal.mul(taxRate);
      const shippingAmount = new Prisma.Decimal(0); // Free shipping for demo
      const totalAmount = subtotal.add(tax).add(shippingAmount);

      // Create order with transaction
      const order = await prisma.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId,
            subtotal,
            tax,
            shippingAmount,
            totalAmount,
            shippingAddress: body.shippingAddress,
            billingAddress: body.billingAddress || body.shippingAddress,
            notes: body.notes,
            items: {
              create: orderItems,
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, imageUrl: true },
                },
              },
            },
          },
        });

        // Update product stock
        for (const item of body.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return newOrder;
      });

      return reply.status(201).send({ success: true, data: order });
    }
  );

  // List user orders
  app.get(
    "/",
    { preHandler: [authGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = listOrdersQuerySchema.parse(request.query);
      const { page, limit, status } = query;
      const userId = request.userId!;

      const where: Prisma.OrderWhereInput = { userId };
      if (status) {
        where.status = status;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, imageUrl: true },
                },
              },
            },
          },
        }),
        prisma.order.count({ where }),
      ]);

      return reply.send({
        success: true,
        data: orders,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  );

  // Get single order
  app.get(
    "/:id",
    { preHandler: [authGuard] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const userId = request.userId!;
      const isAdmin = request.userRole === "ADMIN";

      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
          ...(isAdmin ? {} : { userId }),
        },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, imageUrl: true },
              },
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      return reply.send({ success: true, data: order });
    }
  );

  // Cancel order (user can cancel pending orders)
  app.post(
    "/:id/cancel",
    { preHandler: [authGuard] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const userId = request.userId!;

      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
          userId,
        },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        throw new BadRequestError(
          `Cannot cancel order with status: ${order.status}`
        );
      }

      // Cancel and restore stock
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });

        // Restore stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      });

      return reply.send({ success: true, message: "Order cancelled" });
    }
  );

  // ========================================
  // Admin routes
  // ========================================

  // List all orders (admin)
  app.get(
    "/admin/all",
    { preHandler: [adminGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = listOrdersQuerySchema.parse(request.query);
      const { page, limit, status } = query;

      const where: Prisma.OrderWhereInput = {};
      if (status) {
        where.status = status;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
            _count: { select: { items: true } },
          },
        }),
        prisma.order.count({ where }),
      ]);

      return reply.send({
        success: true,
        data: orders,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  );

  // Update order status (admin)
  app.patch(
    "/:id/status",
    { preHandler: [adminGuard] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const body = updateOrderStatusSchema.parse(request.body);

      const order = await prisma.order.findUnique({ where: { id } });

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      const updateData: Prisma.OrderUpdateInput = {
        status: body.status,
        notes: body.notes ? `${order.notes || ""}\n${body.notes}` : order.notes,
      };

      // Set timestamps based on status
      switch (body.status) {
        case "CONFIRMED":
          updateData.paidAt = new Date();
          break;
        case "SHIPPED":
          updateData.shippedAt = new Date();
          break;
        case "DELIVERED":
          updateData.deliveredAt = new Date();
          break;
        case "CANCELLED":
          updateData.cancelledAt = new Date();
          break;
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          items: true,
        },
      });

      return reply.send({ success: true, data: updatedOrder });
    }
  );

  // Order statistics (admin)
  app.get(
    "/admin/stats",
    { preHandler: [adminGuard] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const [totalOrders, ordersByStatus, recentRevenue] = await Promise.all([
        prisma.order.count(),
        prisma.order.groupBy({
          by: ["status"],
          _count: { id: true },
        }),
        prisma.order.aggregate({
          where: {
            status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
      ]);

      return reply.send({
        success: true,
        data: {
          totalOrders,
          ordersByStatus: ordersByStatus.reduce(
            (acc, item) => {
              acc[item.status] = item._count.id;
              return acc;
            },
            {} as Record<string, number>
          ),
          last30Days: {
            revenue: recentRevenue._sum.totalAmount || 0,
            orders: recentRevenue._count.id,
          },
        },
      });
    }
  );
}
