const request = require("supertest");
const app = require("../server");
const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

jest.mock("../config/supabase");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../config/redis");
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          url: "https://fake-checkout-url",
          id: "cs_test_123",
        }),
      },
    },
  }));
});

describe("Checkout Routes", () => {
  let authCookie = null;

  beforeAll(async () => {
    // Mock user data
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 1,
          email: "test@example.com",
          password_hash: "hashedpass",
          email_verified: true,
          auth_provider: "local",
          role: "consumer",
          full_name: "Test User",
        },
        error: null,
      }),
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-session-token");
    redisClient.set.mockResolvedValue("OK");
    redisClient.get.mockResolvedValue(
      JSON.stringify({
        id: 1,
        email: "test@example.com",
        role: "consumer",
      })
    );

    // Login to get auth cookie
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "testpassword" });

    authCookie = loginResponse.headers["set-cookie"];
  });

  afterAll(async () => {
    await redisClient.quit?.();
  });

  describe("POST /create-checkout-session", () => {
    it("should return 401 if not authenticated", async () => {
      const response = await request(app)
        .post("/create-checkout-session")
        .send({ items: [{ id: 1, name: "Test", price: 1000, quantity: 1 }] });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 if no items provided", async () => {
      const response = await request(app)
        .post("/create-checkout-session")
        .set("Cookie", authCookie)
        .send({ items: [] });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message", "No items provided");
    });

    it("should create a checkout session and respond with URL", async () => {
      const mockItems = [
        {
          id: "prod_123",
          name: "Test Product",
          price: 1000,
          quantity: 2,
        },
      ];

      const response = await request(app)
        .post("/create-checkout-session")
        .set("Cookie", authCookie)
        .send({ items: mockItems });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("url", "https://fake-checkout-url");
    });
  });
});
