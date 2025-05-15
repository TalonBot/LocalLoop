const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const port = 5000;
app.use(cookieParser());
app.use(express.json());

const authRoutes = require("./routes/auth");

app.use("/auth", authRoutes);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
