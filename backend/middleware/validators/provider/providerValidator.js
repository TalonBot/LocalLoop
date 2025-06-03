const redisClient = require("../../../config/redis");
const supabase = require("../../../config/supabase");

const verifyProvider = async (req, res, next) => {
  try {
    const sessionId = req.cookies.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized: No session ID" });
    }

    const session = await redisClient.get(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized: Invalid session" });
    }

    const { role, userId, name } = JSON.parse(session);
    if (role !== "provider") {
      return res.status(403).json({ message: "Forbidden: Providers only" });
    }

    req.providerId = userId;
    req.providerName = name;

    next();
  } catch (error) {
    console.error("Consumer verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const ensureProductOwnership = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const providerId = req.providerId;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const { data, error } = await supabase
      .from("products")
      .select("producer_id")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!data) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (data.producer_id !== providerId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this product" });
    }

    next();
  } catch (err) {
    console.error("ensureProductOwnership error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { verifyProvider, ensureProductOwnership };
