// backend/routes/location.js
const express = require("express");
const router = express.Router();
const { saveLocation, getNearbyProducers } = require("../controllers/locationController");
const { validateLocation } = require("../middleware/validators/locationValidator");
const refreshSession = require("../middleware/sessionMiddleware");

router.post("/", refreshSession, validateLocation, saveLocation);
router.get("/nearby-producers", getNearbyProducers);

module.exports = router;
