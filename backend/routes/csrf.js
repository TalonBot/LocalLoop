const express = require("express");
const router = express.Router();
const csrfMiddleware = require("../middleware/csrfMiddleware");

router.get("/csrf-token", csrfMiddleware, (req, res) => {
  res.json({ csrfToken: req.csrfToken });
});

module.exports = router;
