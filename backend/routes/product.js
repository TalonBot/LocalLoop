const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const {
  verifyProvider,
  ensureProductOwnership,
} = require("../middleware/validators/provider/providerValidator");
const productValidationRules = require("../middleware/validators/provider/productsValidator");
const validate = require("../middleware/validators/provider/validate");
const productController = require("../controllers/productController");
const refreshSession = require("../middleware/sessionMiddleware");

router.post(
  "/new",
  verifyProvider,
  refreshSession,
  upload.array("images", 5),
  productValidationRules,
  validate,
  productController.createProduct
);

router.get(
  "/",
  verifyProvider,
  refreshSession,
  productController.getMyProducts
);

router.put(
  "/:id",
  verifyProvider,
  refreshSession,
  upload.array("images", 5),
  validate,
  productController.updateProduct
);

router.delete(
  "/:id",
  verifyProvider,
  refreshSession,
  ensureProductOwnership,
  productController.deleteProduct
);

router.patch(
  "/:id/toggle",
  verifyProvider,
  refreshSession,
  ensureProductOwnership,
  productController.toggleAvailability
);

router.get(
  "/:id",
  verifyProvider,
  refreshSession,
  ensureProductOwnership,
  productController.getProductById
);

module.exports = router;
