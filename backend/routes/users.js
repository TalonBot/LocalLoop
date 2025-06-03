const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductsByCategory,
  getAllProducers,
  getProducerById,
  getRecommendations,
  getCategoriesWithCounts,
  getPriceRange,
  validateCoupon,
  getAverageRatingForProducer,
  getAverageRatingsForAllProducers,
} = require("../controllers/user");

router.get("/", getProducts);

router.get("/validate/:code", validateCoupon);

router.get("/category/count", getCategoriesWithCounts);

router.get("/price-range", getPriceRange);

router.get("/:id", getProductById);

router.get("/category/:category", getProductsByCategory);

// GET /api/producers?page=1&limit=10
router.get("/producers/page", getAllProducers);

// GET /api/producers/:id?page=1&limit=10
router.get("/producers/:id", getProducerById);

router.get("/recommendations/top", getRecommendations);

router.get("/producer/:id/average-rating", getAverageRatingForProducer);

router.get("/producers/ratings/all", getAverageRatingsForAllProducers);
module.exports = router;
