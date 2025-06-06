const request = require("supertest");
const app = require("../server.js");
const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const { sendEmail } = require("../helpers/mailer.js");

jest.mock("../config/supabase");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../config/redis");

jest.mock("../helpers/mailer.js");

describe("Applications Controller", () => {
  let authCookie = null;

  beforeAll(async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 1,
          email: "admin@example.com",
          password_hash: "hashedpass",
          email_verified: true,
          auth_provider: "local",
          role: "admin",
          full_name: "Admin User",
        },
        error: null,
      }),
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-session-token");
    redisClient.set.mockResolvedValue("OK");

    redisClient.get = jest.fn().mockResolvedValue(
      JSON.stringify({
        id: 1,
        email: "admin@example.com",
        role: "admin",
      })
    );

    supabase.storage = {
      from: jest.fn(),
    };

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: "admin@example.com", password: "adminpassword" });

    authCookie = loginResponse.headers["set-cookie"];
  });

  afterAll(async () => {
    if (redisClient.quit) {
      await redisClient.quit();
    }
  });

  describe("GET /admin/applications/:id", () => {
    it("should fetch single application with signed URLs", async () => {
      const mockApp = {
        id: "123",
        user_id: "user1",
        documents: ["doc1.pdf", "doc2.pdf"],
      };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockApp,
          error: null,
        }),
      });

      supabase.storage.from.mockReturnValue({
        createSignedUrls: jest.fn().mockResolvedValue({
          data: [
            { path: "doc1.pdf", signedUrl: "http://example.com/doc1" },
            { path: "doc2.pdf", signedUrl: "http://example.com/doc2" },
          ],
          error: null,
        }),
      });

      const response = await request(app)
        .get("/admin/applications/123")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockApp,
        signedUrls: [
          { path: "doc1.pdf", signedUrl: "http://example.com/doc1" },
          { path: "doc2.pdf", signedUrl: "http://example.com/doc2" },
        ],
      });
    });

    it("should return 404 if application not found", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      });

      const response = await request(app)
        .get("/admin/applications/999")
        .set("Cookie", authCookie);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Application not found" });
    });
  });
  describe("PATCH /admin/applications/:id/review", () => {
    const applicationId = "123";

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should approve the application and send email", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: applicationId,
            users: { email: "user@example.com", full_name: "John Doe" },
          },
          error: null,
        }),
      });

      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      sendEmail.mockResolvedValue("OK");

      const response = await request(app)
        .patch(`/admin/applications/${applicationId}/review`)
        .set("Cookie", authCookie)
        .send({ status: "approved", admin_notes: "Looks good" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Application approved" });
      expect(sendEmail).toHaveBeenCalledWith(
        "user@example.com",
        process.env.SENDGRID_APPROVED_TEMPLATE_ID,
        { full_name: "John Doe", admin_notes: "Looks good" },
        "Your application has been approved"
      );
    });

    it("should reject the application and send email", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: applicationId,
            users: { email: "user@example.com", full_name: "Jane Smith" },
          },
          error: null,
        }),
      });

      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      sendEmail.mockResolvedValue("OK");

      const response = await request(app)
        .patch(`/admin/applications/${applicationId}/review`)
        .set("Cookie", authCookie)
        .send({ status: "rejected", admin_notes: "Insufficient info" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Application rejected" });
      expect(sendEmail).toHaveBeenCalledWith(
        "user@example.com",
        process.env.SENDGRID_REJECTED_TEMPLATE_ID,
        { full_name: "Jane Smith", admin_notes: "Insufficient info" },
        "Your application has been rejected"
      );
    });

    it("should return 400 for missing admin_notes when rejecting", async () => {
      const response = await request(app)
        .patch(`/admin/applications/${applicationId}/review`)
        .set("Cookie", authCookie)
        .send({ status: "rejected" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Admin notes required when rejecting an application",
      });
    });

    it("should return 400 for invalid status", async () => {
      const response = await request(app)
        .patch(`/admin/applications/${applicationId}/review`)
        .set("Cookie", authCookie)
        .send({ status: "pending", admin_notes: "..." });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Status must be 'approved' or 'rejected'",
      });
    });

    it("should return 404 if application is not found", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      });

      const response = await request(app)
        .patch(`/admin/applications/${applicationId}/review`)
        .set("Cookie", authCookie)
        .send({ status: "approved", admin_notes: "..." });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Application not found" });
    });

    it("should return 500 if update fails", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: applicationId,
            users: { email: "user@example.com", full_name: "Test User" },
          },
          error: null,
        }),
      });

      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest
          .fn()
          .mockResolvedValue({ error: { message: "Update failed" } }),
      });

      const response = await request(app)
        .patch(`/admin/applications/${applicationId}/review`)
        .set("Cookie", authCookie)
        .send({ status: "approved", admin_notes: "..." });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Update failed" });
    });
  });
  describe("GET /admin/providers", () => {
    it("should return a list of providers", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: "1",
              full_name: "Alice Provider",
              email: "alice@example.com",
              role: "provider",
              created_at: "2024-01-01T00:00:00Z",
            },
            {
              id: "2",
              full_name: "Bob Provider",
              email: "bob@example.com",
              role: "provider",
              created_at: "2023-12-01T00:00:00Z",
            },
          ],
          error: null,
        }),
      });

      const response = await request(app)
        .get("/admin/providers")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: "1",
          full_name: "Alice Provider",
          email: "alice@example.com",
          role: "provider",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          full_name: "Bob Provider",
          email: "bob@example.com",
          role: "provider",
          created_at: "2023-12-01T00:00:00Z",
        },
      ]);
    });

    it("should return 500 on Supabase error", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Supabase failure" },
        }),
      });

      const response = await request(app)
        .get("/admin/providers")
        .set("Cookie", authCookie);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Supabase failure" });
    });

    it("should return 500 on unexpected error", async () => {
      supabase.from.mockImplementation(() => {
        throw new Error("Unexpected crash");
      });

      const response = await request(app)
        .get("/admin/providers")
        .set("Cookie", authCookie);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });
  describe("GET /admin/applications/:id", () => {
    it("should fetch single application with signed URLs", async () => {
      const mockApp = {
        id: "123",
        user_id: "user1",
        documents: ["doc1.pdf", "doc2.pdf"],
      };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockApp,
          error: null,
        }),
      });

      supabase.storage.from.mockReturnValue({
        createSignedUrls: jest.fn().mockResolvedValue({
          data: [
            { path: "doc1.pdf", signedUrl: "http://example.com/doc1" },
            { path: "doc2.pdf", signedUrl: "http://example.com/doc2" },
          ],
          error: null,
        }),
      });

      const response = await request(app)
        .get("/admin/applications/123")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockApp,
        signedUrls: [
          { path: "doc1.pdf", signedUrl: "http://example.com/doc1" },
          { path: "doc2.pdf", signedUrl: "http://example.com/doc2" },
        ],
      });
    });

    it("should return 404 if application not found", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      });

      const response = await request(app)
        .get("/admin/applications/999")
        .set("Cookie", authCookie);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Application not found" });
    });
  });

  describe("GET /admin/profits/:providerId", () => {
    const providerId = "provider123";

    const mockProviderData = {
      full_name: "Jane Doe",
      email: "jane@example.com",
    };

    const mockRegularOrders = [
      {
        order_id: "ord1",
        created_at: "2024-06-01T00:00:00Z",
        total_price: "40.00",
        product_id: "prod1",
        product_name: "Apples",
        quantity: 2,
        unit_price: "20.00",
      },
    ];

    const mockGroupItems = [
      {
        participant_id: "part1",
        group_order_id: "group1",
        joined_at: "2024-06-01T00:00:00Z",
        pickup_or_delivery: "pickup",
        quantity: 1,
        unit_price: "30.00",
        product_id: "prod2",
        product_name: "Honey",
        total_price: "30.00",
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return combined revenue report", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockProviderData, error: null }),
      });

      supabase.rpc
        .mockResolvedValueOnce({ data: mockRegularOrders, error: null })
        .mockResolvedValueOnce({ data: mockGroupItems, error: null });

      const response = await request(app)
        .get(`/admin/profits/${providerId}?timeframe=month`)
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body.revenue.total).toBeCloseTo(70);

      expect(response.body.regular_orders).toHaveLength(1);
      expect(response.body.group_order_items).toHaveLength(1);
      expect(response.body.invoice_recipient).toBe(mockProviderData.full_name);
      expect(response.body.invoice_email).toBe(mockProviderData.email);
    });

    it("should handle provider fetch error gracefully", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Provider not found" },
        }),
      });

      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      const response = await request(app)
        .get(`/admin/profits/${providerId}`)
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body.invoice_recipient).toBe("N/A");
      expect(response.body.invoice_email).toBe("N/A");
      expect(response.body.regular_orders).toEqual([]);
      expect(response.body.group_order_items).toEqual([]);
      expect(response.body.revenue.total).toBe(0);
    });

    it("should return 500 if regular orders RPC fails", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockProviderData, error: null }),
      });

      supabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: "RPC fail" },
      });

      const response = await request(app)
        .get(`/admin/profits/${providerId}`)
        .set("Cookie", authCookie);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe(
        "Failed to fetch regular provider orders"
      );
    });

    it("should return 500 if group items RPC fails", async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockProviderData, error: null }),
      });

      supabase.rpc
        .mockResolvedValueOnce({ data: mockRegularOrders, error: null })
        .mockResolvedValueOnce({
          data: null,
          error: { message: "Group fail" },
        });

      const response = await request(app)
        .get(`/admin/profits/${providerId}`)
        .set("Cookie", authCookie);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe(
        "Failed to fetch group order participant items"
      );
    });

    it("should return 500 on unexpected server error", async () => {
      supabase.from.mockImplementation(() => {
        throw new Error("Unexpected failure");
      });

      const response = await request(app)
        .get(`/admin/profits/${providerId}`)
        .set("Cookie", authCookie);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });
});
