const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const port = 5000;
app.use(cookieParser());
app.use("/webhook", require("./routes/webhook"));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const providerRoutes = require("./routes/provider");
const consumerRoutes = require("./routes/consumer");
const checkoutRoutes = require("./routes/checkoutRoutes");
const adminRoutes = require("./routes/admin");
const usersRoutes = require("./routes/users");
const locationRoutes = require("./routes/location");

app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/provider", providerRoutes);
app.use("/consumer", consumerRoutes);
app.use("/", checkoutRoutes);
app.use("/admin", adminRoutes);
app.use("/users", usersRoutes);
app.use("/location", locationRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
