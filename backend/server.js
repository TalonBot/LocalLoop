const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const port = 5000;
app.use(cookieParser());
app.use("/webhook", require("./routes/webhook"));
app.use(express.json());
app.use(
  cors({
    origin: "https://local-loop-liard.vercel.app",
    credentials: true,
  })
);

require("./cron/weekly");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const providerRoutes = require("./routes/provider");
const consumerRoutes = require("./routes/consumer");
const checkoutRoutes = require("./routes/checkoutRoutes");
const adminRoutes = require("./routes/admin");
const usersRoutes = require("./routes/users");
const locationRoutes = require("./routes/location");
//dodano
const publicRoutes = require("./routes/public");

app.use("/public", publicRoutes);
app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/provider", providerRoutes);
app.use("/consumer", consumerRoutes);
app.use("/", checkoutRoutes);
app.use("/admin", adminRoutes);
app.use("/users", usersRoutes);
app.use("/location", locationRoutes);

module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
