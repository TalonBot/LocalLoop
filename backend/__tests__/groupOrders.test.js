// ✅ Put this at the top BEFORE importing the router or supabase
jest.mock("../config/supabase", () => {
  const mock = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn(),
    eq: jest.fn(),
  };
  return mock;
});

const request = require("supertest");
const express = require("express");
const router = require("../routes/public"); // Adjust path if needed
const supabase = require("../config/supabase");

const app = express();
app.use(express.json());
app.use("/public", router); // Match your route path

describe("Group Orders Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /public/group-orders", () => {
    it("should return all group orders", async () => {
      const mockData = [
        {
          id: "1",
          description: "Group Order 1",
          created_at: "2024-01-01",
          status: "active",
        },
        {
          id: "2",
          description: "Group Order 2",
          created_at: "2024-01-02",
          status: "completed",
        },
      ];

      supabase.order.mockResolvedValueOnce({ data: mockData, error: null });

      const res = await request(app).get("/public/group-orders");

      expect(res.statusCode).toBe(200);
      expect(res.body.groupOrders).toEqual(mockData);
    });

    it("should handle errors when fetching group orders", async () => {
      supabase.order.mockResolvedValueOnce({
        data: null,
        error: new Error("DB error"),
      });

      const res = await request(app).get("/public/group-orders");

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("Failed to fetch group orders");
    });
  });

  describe("GET /public/group-orders/:id/products", () => {
    const groupOrderId = "group-1";

    it("should return products for a specific group order", async () => {
      const mockData = [
        {
          unit_price: 10,
          max_quantity: 100,
          product: {
            id: "prod-1",
            name: "Apples",
            description: "Fresh apples",
            category: "Fruit",
            unit: "kg",
            product_images: [{ image_url: "https://example.com/apple.jpg" }],
          },
        },
      ];

      supabase.eq.mockResolvedValueOnce({ data: mockData, error: null });

      const res = await request(app).get(
        `/public/group-orders/${groupOrderId}/products`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.products).toEqual(mockData);
    });

    it("should handle errors when fetching group order products", async () => {
      supabase.eq.mockResolvedValueOnce({
        data: null,
        error: new Error("DB error"),
      });

      const res = await request(app).get(
        `/public/group-orders/${groupOrderId}/products`
      );

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe(
        "Failed to fetch products for this group order"
      );
    });
  });
});
