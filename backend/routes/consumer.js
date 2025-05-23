const express = require("express");
const router = express.Router();
const { joinGroupOrder } = require("../controllers/consumerController");
const verifyConsumer = require("../middleware/validators/consumer/consumerValidator");

router.post("/join-group-order", verifyConsumer, joinGroupOrder);

module.exports = router;
