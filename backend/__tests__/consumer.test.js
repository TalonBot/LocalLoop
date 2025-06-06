const request = require("supertest");
const app = require("../server");
const supabase = require("../config/supabase");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

jest.mock("multer", () => {
  const m = {
    single: () => (req, res, next) => next(),
    array: () => (req, res, next) => {
      req.files = [
        {
          originalname: "test.pdf",
          mimetype: "application/pdf",
          buffer: Buffer.from("test"),
        },
      ];
      next();
    },
  };

  const mockMulter = () => m;
  mockMulter.memoryStorage = () => ({
    _handleFile: (req, file, cb) =>
      cb(null, {
        buffer: Buffer.from("test"),
        size: 12345,
      }),
    _removeFile: (req, file, cb) => cb(null),
  });

  return mockMulter;
});

jest.mock(
  "../middleware/validators/consumer/consumerValidator",
  () => (req, res, next) => {
    req.consumerId = "mock-consumer-id";
    next();
  }
);

jest.mock("../middleware/sessionMiddleware", () => (req, res, next) => next());

jest.mock("../config/supabase", () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest
      .fn()
      .mockResolvedValue({ data: { path: "test-path" }, error: null }),
  },
  insert: jest.fn().mockResolvedValue({ error: null }),
}));

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest
          .fn()
          .mockResolvedValue({ url: "https://stripe.com/checkout" }),
      },
    },
  }));
});

describe("Consumer Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /consumer/join-group-order", () => {
    it("should return 400 if group_order_id is missing", async () => {
      const response = await request(app)
        .post("/consumer/join-group-order")
        .send({
          items: [{ product_id: 1, quantity: 2 }],
          delivery_details: {},
          notes: "",
          pickup_or_delivery: "pickup",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Group order ID is required");
    });
  });
});
