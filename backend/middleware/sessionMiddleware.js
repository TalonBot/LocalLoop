const redisClient = require("../config/redis");

const refreshSession = async (req, res, next) => {
  const sessionId = req.cookies.session_id;

  try {
    if (!sessionId) {
      return res.status(400).json({ message: "No session cookie provided" });
    }

    const sessionData = await redisClient.get(sessionId);

    if (!sessionData) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    await redisClient.expire(sessionId, 900); // Refresh TTL
    req.session = JSON.parse(sessionData); // Attach session data for downstream use
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error refreshing session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = refreshSession;
