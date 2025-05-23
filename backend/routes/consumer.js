const express = require("express");
const router = express.Router();
const {
  joinGroupOrder,
  applyToBeProducer,
} = require("../controllers/consumerController");
const verifyConsumer = require("../middleware/validators/consumer/consumerValidator");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/join-group-order", verifyConsumer, joinGroupOrder);

router.post(
  "/upload-document",
  verifyConsumer,
  upload.array("documents", 5),
  applyToBeProducer
);

module.exports = router;
