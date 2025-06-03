const crypto = require("crypto");
const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

const csrfMiddleware = (req, res, next) => {
  if (req.method === "GET") {
    const token = generateCsrfToken();
    res.cookie("csrfToken", token, {
      httpOnly: false,
      sameSite: "None",
      secure: true,
      //domain: ".",
    });
    req.csrfToken = token;
  }
  next();
};

module.exports = csrfMiddleware;
