const redis = require("redis");
const client = redis.createClient({
  url: process.env.REDIS_URL,
  port: process.env.REDIS_PORT,
});

client.connect();

client.on("connect", () => {
  console.log("Connected to Redis server");
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = client;
