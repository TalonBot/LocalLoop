const express = require("express");
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/admin/couponsController");
const {
  getAllProducerApplications,
  getProducerApplicationById,
  reviewProducerApplication,
  fetchApprovedProviders,
  getMonthlyProviderProfits,
} = require("../controllers/admin/applicationController");
const verifyAdmin = require("../middleware/validators/admin/validateAdmin");

router.get("/coupon", verifyAdmin, getCoupons);
router.post("/coupon", verifyAdmin, createCoupon);
router.put("/coupon/:id", verifyAdmin, updateCoupon);
router.delete("/coupon/:id", verifyAdmin, deleteCoupon);

router.get("/applications", verifyAdmin, getAllProducerApplications);
router.get("/applications/:id", verifyAdmin, getProducerApplicationById);
router.patch(
  "/applications/:id/review",
  verifyAdmin,
  reviewProducerApplication
);

router.get("/providers", verifyAdmin, fetchApprovedProviders);

router.get("/profits/:providerId", getMonthlyProviderProfits);

module.exports = router;
