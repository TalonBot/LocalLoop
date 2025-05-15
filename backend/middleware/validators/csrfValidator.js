const csrfValidator = (req, res, next) => {
  const tokenFromCookie = req.cookies.csrfToken;
  const tokenFromHeader = req.headers["x-csrf-token"];

  if (
    !tokenFromCookie ||
    !tokenFromHeader ||
    tokenFromCookie !== tokenFromHeader
  ) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  next();
};

module.exports = csrfValidator;
