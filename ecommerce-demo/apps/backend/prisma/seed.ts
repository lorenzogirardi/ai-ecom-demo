import { PrismaClient, UserRole, ProductStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // Clean existing data
  console.log("Cleaning existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // Users
  // ============================================
  console.log("Creating users...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "john@example.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      role: UserRole.CUSTOMER,
      isActive: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "jane@example.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Smith",
      role: UserRole.CUSTOMER,
      isActive: true,
    },
  });

  console.log(`  Created ${3} users`);

  // ============================================
  // Categories
  // ============================================
  console.log("Creating categories...");

  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and gadgets",
      imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
      isActive: true,
      sortOrder: 1,
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
      isActive: true,
      sortOrder: 2,
    },
  });

  const homeGarden = await prisma.category.create({
    data: {
      name: "Home & Garden",
      slug: "home-garden",
      description: "Home decor and garden supplies",
      imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400",
      isActive: true,
      sortOrder: 3,
    },
  });

  const sports = await prisma.category.create({
    data: {
      name: "Sports & Outdoors",
      slug: "sports-outdoors",
      description: "Sports equipment and outdoor gear",
      imageUrl: "https://images.unsplash.com/photo-1461896836934- voices-of-passion?w=400",
      isActive: true,
      sortOrder: 4,
    },
  });

  const books = await prisma.category.create({
    data: {
      name: "Books",
      slug: "books",
      description: "Books, ebooks, and audiobooks",
      imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
      isActive: true,
      sortOrder: 5,
    },
  });

  // Subcategories
  const smartphones = await prisma.category.create({
    data: {
      name: "Smartphones",
      slug: "smartphones",
      description: "Mobile phones and accessories",
      parentId: electronics.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: "Laptops",
      slug: "laptops",
      description: "Notebooks and ultrabooks",
      parentId: electronics.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  const mensClothing = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: "mens-clothing",
      description: "Clothing for men",
      parentId: clothing.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const womensClothing = await prisma.category.create({
    data: {
      name: "Women's Clothing",
      slug: "womens-clothing",
      description: "Clothing for women",
      parentId: clothing.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  console.log(`  Created ${9} categories`);

  // ============================================
  // Products
  // ============================================
  console.log("Creating products...");

  const products = await prisma.product.createMany({
    data: [
      // Electronics - Smartphones
      {
        categoryId: smartphones.id,
        sku: "IPHONE-15-PRO",
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        description: "The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.",
        price: 999.99,
        compareAt: 1099.99,
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },
      {
        categoryId: smartphones.id,
        sku: "SAMSUNG-S24-ULTRA",
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description: "Premium Android smartphone with S Pen, 200MP camera, and AI features.",
        price: 1199.99,
        compareAt: 1299.99,
        stock: 35,
        imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },
      {
        categoryId: smartphones.id,
        sku: "PIXEL-8-PRO",
        name: "Google Pixel 8 Pro",
        slug: "google-pixel-8-pro",
        description: "Google's flagship phone with Tensor G3 chip and advanced AI photography.",
        price: 899.99,
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: false,
      },
      // Electronics - Laptops
      {
        categoryId: laptops.id,
        sku: "MACBOOK-PRO-16",
        name: "MacBook Pro 16\" M3 Max",
        slug: "macbook-pro-16-m3-max",
        description: "Powerful laptop for professionals with M3 Max chip and stunning Liquid Retina XDR display.",
        price: 3499.99,
        compareAt: 3699.99,
        stock: 20,
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },
      {
        categoryId: laptops.id,
        sku: "DELL-XPS-15",
        name: "Dell XPS 15",
        slug: "dell-xps-15",
        description: "Premium Windows laptop with InfinityEdge display and Intel Core i9.",
        price: 1899.99,
        stock: 25,
        imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: false,
      },
      {
        categoryId: laptops.id,
        sku: "THINKPAD-X1-CARBON",
        name: "Lenovo ThinkPad X1 Carbon",
        slug: "lenovo-thinkpad-x1-carbon",
        description: "Business ultrabook with legendary ThinkPad keyboard and all-day battery.",
        price: 1649.99,
        stock: 30,
        imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: false,
      },
      // Clothing - Men's
      {
        categoryId: mensClothing.id,
        sku: "MENS-CLASSIC-TEE",
        name: "Classic Cotton T-Shirt",
        slug: "mens-classic-cotton-tshirt",
        description: "Premium 100% cotton t-shirt with comfortable fit.",
        price: 29.99,
        compareAt: 39.99,
        stock: 200,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: false,
      },
      {
        categoryId: mensClothing.id,
        sku: "MENS-SLIM-JEANS",
        name: "Slim Fit Denim Jeans",
        slug: "mens-slim-fit-denim-jeans",
        description: "Modern slim fit jeans with stretch comfort.",
        price: 79.99,
        stock: 150,
        imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },
      // Clothing - Women's
      {
        categoryId: womensClothing.id,
        sku: "WOMENS-SUMMER-DRESS",
        name: "Floral Summer Dress",
        slug: "womens-floral-summer-dress",
        description: "Light and breezy summer dress with beautiful floral pattern.",
        price: 89.99,
        compareAt: 119.99,
        stock: 75,
        imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },
      {
        categoryId: womensClothing.id,
        sku: "WOMENS-LEATHER-JACKET",
        name: "Classic Leather Jacket",
        slug: "womens-classic-leather-jacket",
        description: "Timeless leather jacket with modern fit.",
        price: 299.99,
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: false,
      },
      // Home & Garden
      {
        categoryId: homeGarden.id,
        sku: "MODERN-TABLE-LAMP",
        name: "Modern LED Table Lamp",
        slug: "modern-led-table-lamp",
        description: "Sleek table lamp with adjustable brightness and color temperature.",
        price: 79.99,
        stock: 60,
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: false,
      },
      {
        categoryId: homeGarden.id,
        sku: "INDOOR-PLANT-SET",
        name: "Indoor Plant Collection",
        slug: "indoor-plant-collection",
        description: "Set of 3 low-maintenance indoor plants with decorative pots.",
        price: 49.99,
        stock: 45,
        imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },
      // Sports
      {
        categoryId: sports.id,
        sku: "YOGA-MAT-PRO",
        name: "Professional Yoga Mat",
        slug: "professional-yoga-mat",
        description: "Extra thick, non-slip yoga mat for all skill levels.",
        price: 59.99,
        stock: 100,
        imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: false,
      },
      {
        categoryId: sports.id,
        sku: "RUNNING-SHOES-AIR",
        name: "Air Cushion Running Shoes",
        slug: "air-cushion-running-shoes",
        description: "Lightweight running shoes with responsive air cushioning.",
        price: 129.99,
        compareAt: 159.99,
        stock: 80,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },
      // Books
      {
        categoryId: books.id,
        sku: "BOOK-CLEAN-CODE",
        name: "Clean Code: A Handbook",
        slug: "clean-code-handbook",
        description: "Robert C. Martin's guide to writing clean, maintainable code.",
        price: 44.99,
        stock: 120,
        imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: false,
      },
      {
        categoryId: books.id,
        sku: "BOOK-SYSTEM-DESIGN",
        name: "System Design Interview",
        slug: "system-design-interview",
        description: "Comprehensive guide to acing system design interviews.",
        price: 39.99,
        stock: 90,
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
        status: ProductStatus.ACTIVE,
        isFeatured: true,
      },
      // Draft product (not visible)
      {
        categoryId: electronics.id,
        sku: "UNRELEASED-GADGET",
        name: "Mystery Gadget 2025",
        slug: "mystery-gadget-2025",
        description: "Coming soon - revolutionary new device.",
        price: 599.99,
        stock: 0,
        status: ProductStatus.DRAFT,
        isFeatured: false,
      },
      // Archived product
      {
        categoryId: electronics.id,
        sku: "OLD-PHONE-MODEL",
        name: "Discontinued Phone Model",
        slug: "discontinued-phone-model",
        description: "This product has been discontinued.",
        price: 299.99,
        stock: 0,
        status: ProductStatus.ARCHIVED,
        isFeatured: false,
      },
    ],
  });

  console.log(`  Created ${products.count} products`);

  // ============================================
  // Sample Orders
  // ============================================
  console.log("Creating sample orders...");

  // Get some products for orders
  const iphone = await prisma.product.findUnique({ where: { sku: "IPHONE-15-PRO" } });
  const macbook = await prisma.product.findUnique({ where: { sku: "MACBOOK-PRO-16" } });
  const tshirt = await prisma.product.findUnique({ where: { sku: "MENS-CLASSIC-TEE" } });

  if (iphone && macbook && tshirt) {
    // Order 1 - Delivered
    await prisma.order.create({
      data: {
        orderNumber: "ORD-2024-0001",
        userId: customer1.id,
        status: "DELIVERED",
        subtotal: 999.99,
        tax: 100.00,
        shippingAmount: 0,
        totalAmount: 1099.99,
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          address1: "123 Main Street",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
        billingAddress: {
          firstName: "John",
          lastName: "Doe",
          address1: "123 Main Street",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
        paidAt: new Date("2024-12-20T10:00:00Z"),
        shippedAt: new Date("2024-12-21T14:00:00Z"),
        deliveredAt: new Date("2024-12-23T16:00:00Z"),
        items: {
          create: [
            {
              productId: iphone.id,
              sku: iphone.sku,
              name: iphone.name,
              quantity: 1,
              unitPrice: 999.99,
              subtotal: 999.99,
            },
          ],
        },
      },
    });

    // Order 2 - Processing
    await prisma.order.create({
      data: {
        orderNumber: "ORD-2024-0002",
        userId: customer2.id,
        status: "PROCESSING",
        subtotal: 3529.98,
        tax: 353.00,
        shippingAmount: 0,
        totalAmount: 3882.98,
        shippingAddress: {
          firstName: "Jane",
          lastName: "Smith",
          address1: "456 Oak Avenue",
          city: "Los Angeles",
          state: "CA",
          postalCode: "90001",
          country: "US",
        },
        billingAddress: {
          firstName: "Jane",
          lastName: "Smith",
          address1: "456 Oak Avenue",
          city: "Los Angeles",
          state: "CA",
          postalCode: "90001",
          country: "US",
        },
        paidAt: new Date("2024-12-24T09:00:00Z"),
        items: {
          create: [
            {
              productId: macbook.id,
              sku: macbook.sku,
              name: macbook.name,
              quantity: 1,
              unitPrice: 3499.99,
              subtotal: 3499.99,
            },
            {
              productId: tshirt.id,
              sku: tshirt.sku,
              name: tshirt.name,
              quantity: 1,
              unitPrice: 29.99,
              subtotal: 29.99,
            },
          ],
        },
      },
    });

    // Order 3 - Pending
    await prisma.order.create({
      data: {
        orderNumber: "ORD-2024-0003",
        userId: customer1.id,
        status: "PENDING",
        subtotal: 59.98,
        tax: 6.00,
        shippingAmount: 5.99,
        totalAmount: 71.97,
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          address1: "123 Main Street",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
        billingAddress: {
          firstName: "John",
          lastName: "Doe",
          address1: "123 Main Street",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
        items: {
          create: [
            {
              productId: tshirt.id,
              sku: tshirt.sku,
              name: tshirt.name,
              quantity: 2,
              unitPrice: 29.99,
              subtotal: 59.98,
            },
          ],
        },
      },
    });

    console.log(`  Created 3 orders`);
  }

  // ============================================
  // Summary
  // ============================================
  console.log("\n========================================");
  console.log("Seed completed successfully!");
  console.log("========================================\n");
  console.log("Demo Accounts:");
  console.log("  Admin:    admin@example.com / password123");
  console.log("  Customer: john@example.com / password123");
  console.log("  Customer: jane@example.com / password123");
  console.log("\nData Created:");
  console.log("  - 3 users (1 admin, 2 customers)");
  console.log("  - 9 categories (5 main + 4 subcategories)");
  console.log("  - 18 products");
  console.log("  - 3 sample orders");
  console.log("");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
