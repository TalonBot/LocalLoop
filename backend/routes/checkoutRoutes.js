const express = require("express");
const router = express.Router();
const verifyConsumer = require("../middleware/validators/consumer/consumerValidator");
const { createCheckoutSession } = require("../controllers/checkoutController");

router.post("/create-checkout-session", verifyConsumer, createCheckoutSession);

module.exports = router;
