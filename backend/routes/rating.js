const express = require("express");
const router = express.Router();
const { getAverageRating } = require("../controllers/ratingController");

router.get("/average", getAverageRating);

module.exports = router;