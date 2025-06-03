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
const { generatePdf } = require("../controllers/admin/pdf");
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

router.get("/profits/:providerId", verifyAdmin, getMonthlyProviderProfits);

router.post("/generate-pdf", verifyAdmin, (req, res) => {
  const data = req.body;

  if (!data || !data.revenue || !data.timeframe) {
    return res.status(400).send({ error: "Invalid payload structure" });
  }

  generatePdf(data, res);
});

module.exports = router;
