const request = require("supertest");
const app = require("../server.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");
const redisClient = require("../config/redis");
const { sendEmail } = require("../helpers/mailer");

// Mock
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../config/supabase");
jest.mock("../config/redis");
jest.mock("../helpers/mailer");

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /login", () => {
    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: "invalid", password: "short" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });

    it("should return 404 for non-existent user", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Not found") }),
      });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found" });
    });

    it("should return 403 for unverified email", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            email: "user@example.com",
            password_hash: "hashedpass",
            email_verified: false,
            auth_provider: "local",
          },
          error: null,
        }),
      });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "user@example.com", password: "password123" });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        message: "Please verify your email before logging in.",
      });
    });

    it("should return 400 for OAuth-registered user", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            email: "user@example.com",
            password_hash: "hashedpass",
            email_verified: true,
            auth_provider: "oauth",
          },
          error: null,
        }),
      });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "user@example.com", password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message:
          "This account was registered using Google OAuth. Please log in with Google.",
      });
    });

    it("should return 400 for invalid credentials", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            email: "user@example.com",
            password_hash: "hashedpass",
            email_verified: true,
            auth_provider: "local",
            role: "consumer",
            full_name: "Test User",
          },
          error: null,
        }),
      });

      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "user@example.com", password: "wrongpassword" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid credentials" });
    });

    it("should login successfully with valid credentials", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            email: "user@example.com",
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

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "user@example.com", password: "correctpassword" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Login successful",
        user: {
          email: "user@example.com",
          name: undefined,
          role: "consumer",
        },
      });
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1, role: "consumer" },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe("POST /logout", () => {
    it("should return 400 if no session cookie", async () => {
      const response = await request(app).post("/auth/logout").send();

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "No session found" });
    });

    it("should logout successfully with valid session", async () => {
      redisClient.del.mockResolvedValue(1);

      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", ["session_id=fake-session-token"])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Logout successful" });
      expect(redisClient.del).toHaveBeenCalledWith("fake-session-token");
      expect(response.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("GET /verify-session", () => {
    it("should return 401 if no session cookie", async () => {
      const response = await request(app).get("/auth/verify-session").send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "No session found" });
      expect(response.headers["cache-control"]).toBe("no-store");
    });

    it("should return 401 for invalid or expired session", async () => {
      redisClient.get.mockResolvedValue(null);

      const response = await request(app)
        .get("/auth/verify-session")
        .set("Cookie", ["session_id=invalid-token"])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid or expired session" });
    });

    it("should return 401 for invalid JWT", async () => {
      redisClient.get.mockResolvedValue(
        JSON.stringify({
          userId: 1,
          role: "consumer",
          name: "Test User",
          email: "user@example.com",
        })
      );
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error("Invalid token"), null);
      });

      const response = await request(app)
        .get("/auth/verify-session")
        .set("Cookie", ["session_id=invalid-jwt"])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid or expired token" });
    });

    it("should return 401 for session data mismatch", async () => {
      redisClient.get.mockResolvedValue(
        JSON.stringify({
          userId: 1,
          role: "consumer",
          name: "Test User",
          email: "user@example.com",
        })
      );
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { userId: 2, role: "admin" });
      });

      const response = await request(app)
        .get("/auth/verify-session")
        .set("Cookie", ["session_id=valid-but-mismatched"])
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Session data mismatch" });
    });

    it("should return valid session data for authenticated user", async () => {
      const sessionData = {
        userId: 1,
        role: "consumer",
        name: "Test User",
        email: "user@example.com",
      };
      redisClient.get.mockResolvedValue(JSON.stringify(sessionData));
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { userId: 1, role: "consumer" });
      });

      const response = await request(app)
        .get("/auth/verify-session")
        .set("Cookie", ["session_id=valid-session"])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Session is valid",
        session: sessionData,
      });
      expect(response.headers["cache-control"]).toBe(
        "private, no-cache, no-store, must-revalidate"
      );
      expect(response.headers["pragma"]).toBe("no-cache");
    });
  });

  describe("POST /register", () => {
    it("should return 400 for invalid input", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ email: "invalid", password: "short", full_name: "" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 for existing email", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      });

      const response = await request(app).post("/auth/register").send({
        email: "existing@example.com",
        password: "validPassword123",
        full_name: "Existing User",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Email already in use" });
    });

    it("should register new user successfully", async () => {
      supabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue({ error: null }),
        });

      bcrypt.hash.mockResolvedValue("hashedPassword");
      sendEmail.mockResolvedValue(true);

      const response = await request(app).post("/auth/register").send({
        email: "newuser@example.com",
        password: "validPassword123",
        full_name: "New User",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "User registered. Please verify your email.",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("validPassword123", 10);
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  describe("POST /verify-email", () => {
    it("should return 400 for invalid email/token", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Not found") }),
      });

      const response = await request(app)
        .post("/auth/verify-email")
        .send({ email: "invalid@example.com", token: "invalid-token" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid email or token" });
    });

    it("should return 400 for expired or invalid token", async () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            email_verification_token: "valid-token",
            email_verification_token_expires: pastDate,
          },
          error: null,
        }),
      });

      const response = await request(app)
        .post("/auth/verify-email")
        .send({ email: "user@example.com", token: "wrong-token" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Token invalid or expired" });
    });

    it("should verify email successfully with valid token", async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      supabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 1,
              email_verification_token: "valid-token",
              email_verification_token_expires: futureDate,
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: null }),
        });

      const response = await request(app)
        .post("/auth/verify-email")
        .send({ email: "user@example.com", token: "valid-token" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Email verified successfully" });
    });

    it("should return 500 for database error during verification", async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      supabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: 1,
              email_verification_token: "valid-token",
              email_verification_token_expires: futureDate,
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: new Error("DB error") }),
        });

      const response = await request(app)
        .post("/auth/verify-email")
        .send({ email: "user@example.com", token: "valid-token" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to verify email" });
    });
  });
});
