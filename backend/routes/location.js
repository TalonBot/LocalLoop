// backend/routes/location.js
const express = require("express");
const router = express.Router();
const { saveLocation } = require("../controllers/locationController");
const { validateLocation } = require("../middleware/validators/locationValidator");
const refreshSession = require("../middleware/sessionMiddleware");

router.post("/", refreshSession, validateLocation, saveLocation);

module.exports = router;
