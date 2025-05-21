const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const port = 5000;
app.use(cookieParser());
app.use("/webhook", require("./routes/webhook"));
app.use(express.json());

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const providerRoutes = require("./routes/provider");

const checkoutRoutes = require("./routes/checkoutRoutes");

app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/provider", providerRoutes);

app.use("/", checkoutRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
