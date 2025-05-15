const redisClient = require("../../../config/redis");

const verifyConsumer = async (req, res, next) => {
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
    if (role !== "consumer") {
      return res.status(403).json({ message: "Forbidden: Consumers only" });
    }

    req.consumerId = userId;
    req.consumerName = name;

    next();
  } catch (error) {
    console.error("Consumer verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = verifyConsumer;
