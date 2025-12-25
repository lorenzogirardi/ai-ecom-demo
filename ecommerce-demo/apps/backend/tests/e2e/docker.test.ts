import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { GenericContainer, StartedTestContainer, Wait, Network, StartedNetwork } from "testcontainers";
import { execSync } from "child_process";
import path from "path";

describe("E2E Docker Tests", () => {
  let network: StartedNetwork;
  let postgresContainer: StartedTestContainer;
  let redisContainer: StartedTestContainer;
  let appContainer: StartedTestContainer;
  let appUrl: string;

  beforeAll(async () => {
    // Create network
    network = await new Network().start();

    // Start PostgreSQL
    postgresContainer = await new GenericContainer("postgres:15-alpine")
      .withNetwork(network)
      .withNetworkAliases("postgres")
      .withEnvironment({
        POSTGRES_USER: "ecommerce",
        POSTGRES_PASSWORD: "ecommerce_secret",
        POSTGRES_DB: "ecommerce_db",
      })
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections"))
      .start();

    // Start Redis
    redisContainer = await new GenericContainer("redis:7-alpine")
      .withNetwork(network)
      .withNetworkAliases("redis")
      .withCommand(["redis-server", "--requirepass", "redis_secret"])
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
      .start();

    // Wait for services to be ready
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Build the app image if not exists
    const dockerfilePath = path.resolve(__dirname, "../../Dockerfile");
    const contextPath = path.resolve(__dirname, "../..");

    try {
      execSync(`docker build -t ecommerce-backend-test -f ${dockerfilePath} ${contextPath}`, {
        stdio: "pipe",
      });
    } catch (error) {
      console.error("Failed to build Docker image:", error);
      throw error;
    }

    // Start app container
    appContainer = await new GenericContainer("ecommerce-backend-test")
      .withNetwork(network)
      .withEnvironment({
        NODE_ENV: "production",
        PORT: "4000",
        DATABASE_URL: "postgresql://ecommerce:ecommerce_secret@postgres:5432/ecommerce_db",
        REDIS_HOST: "redis",
        REDIS_PORT: "6379",
        REDIS_PASSWORD: "redis_secret",
        JWT_SECRET: "e2e-test-secret-key",
        ENABLE_RATE_LIMITING: "false",
        ENABLE_SWAGGER: "true",
      })
      .withExposedPorts(4000)
      .withWaitStrategy(Wait.forHttp("/health", 4000).forStatusCode(200))
      .start();

    appUrl = `http://${appContainer.getHost()}:${appContainer.getMappedPort(4000)}`;

    // Run migrations
    execSync(
      `docker exec ${appContainer.getId()} npx prisma db push --skip-generate`,
      { stdio: "pipe" }
    );
  }, 300000); // 5 minute timeout

  afterAll(async () => {
    if (appContainer) await appContainer.stop();
    if (redisContainer) await redisContainer.stop();
    if (postgresContainer) await postgresContainer.stop();
    if (network) await network.stop();
  });

  describe("Health Checks", () => {
    it("should return healthy status", async () => {
      const response = await fetch(`${appUrl}/health`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe("ok");
      expect(body.timestamp).toBeDefined();
    });

    it("should return ready status when DB and Redis are up", async () => {
      const response = await fetch(`${appUrl}/ready`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe("ready");
    });
  });

  describe("API Endpoints", () => {
    let authToken: string;
    let userId: string;
    let categoryId: string;
    let productId: string;

    it("should register a new user", async () => {
      const response = await fetch(`${appUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "e2e-test@example.com",
          password: "password123",
          firstName: "E2E",
          lastName: "Test",
        }),
      });

      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe("e2e-test@example.com");
      expect(body.data.token).toBeDefined();

      authToken = body.data.token;
      userId = body.data.user.id;
    });

    it("should login with registered user", async () => {
      const response = await fetch(`${appUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "e2e-test@example.com",
          password: "password123",
        }),
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
    });

    it("should get current user profile", async () => {
      const response = await fetch(`${appUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.id).toBe(userId);
      expect(body.data.email).toBe("e2e-test@example.com");
    });

    it("should list categories (empty)", async () => {
      const response = await fetch(`${appUrl}/api/catalog/categories`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it("should list products (empty)", async () => {
      const response = await fetch(`${appUrl}/api/catalog/products`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it("should search with empty results", async () => {
      const response = await fetch(`${appUrl}/api/search?q=test`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.products).toEqual([]);
    });

    it("should reject order without products", async () => {
      const response = await fetch(`${appUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          items: [{ productId: "nonexistent-id", quantity: 1 }],
          shippingAddress: {
            firstName: "Test",
            lastName: "User",
            address1: "123 Test St",
            city: "Test City",
            state: "TS",
            postalCode: "12345",
            country: "US",
          },
        }),
      });

      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.message).toContain("not available");
    });

    it("should list user orders (empty)", async () => {
      const response = await fetch(`${appUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it("should reject unauthorized access", async () => {
      const response = await fetch(`${appUrl}/api/auth/me`);

      expect(response.status).toBe(401);
    });

    it("should reject admin routes for regular users", async () => {
      const response = await fetch(`${appUrl}/api/orders/admin/all`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(403);
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await fetch(`${appUrl}/api/nonexistent`);

      expect(response.status).toBe(404);
    });

    it("should return validation error for invalid data", async () => {
      const response = await fetch(`${appUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          password: "short",
        }),
      });

      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Performance", () => {
    it("should handle multiple concurrent requests", async () => {
      const requests = Array.from({ length: 10 }, () =>
        fetch(`${appUrl}/health`)
      );

      const responses = await Promise.all(requests);

      expect(responses.every((r) => r.status === 200)).toBe(true);
    });

    it("should respond within acceptable time", async () => {
      const start = Date.now();
      await fetch(`${appUrl}/health`);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500); // 500ms max
    });
  });
});
