const redisClient = require("../../../config/redis");

const verifyAdmin = async (req, res, next) => {
  try {
    const sessionId = req.cookies.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized: No session ID" });
    }

    // Verify session exists in Redis
    const session = await redisClient.get(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized: Invalid session" });
    }

    const { role } = JSON.parse(session);

    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = verifyAdmin;
