const express = require("express");
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/admin/couponsController");
const adminMiddleware = require("../middleware/validators/admin/validateAdmin");

router.use(adminMiddleware);

router.get("/coupon", getCoupons);
router.post("/coupon", createCoupon);
router.put("/coupon/:id", updateCoupon);
router.delete("/coupon/:id", deleteCoupon);

module.exports = router;
