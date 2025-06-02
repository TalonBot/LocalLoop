const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  verifyProvider,
} = require("../middleware/validators/provider/providerValidator");
const providerController = require("../controllers/providerController");
const { getMyStory } = require("../controllers/provider/getStory");
const setOrUpdateStory = require("../controllers/provider/setOrUpdateStory");
const refreshSession = require("../middleware/sessionMiddleware");

router.put(
  "/me",
  verifyProvider,
  refreshSession,
  upload.single("profile_image"),
  providerController.updateProfile
);
router.get(
  "/me",
  verifyProvider,
  refreshSession,
  providerController.getProviderInfo
);

router.get(
  "/revenue",
  verifyProvider,
  refreshSession,
  providerController.getProviderRevenue
);

router.post(
  "/pickup",
  verifyProvider,
  refreshSession,
  providerController.confirmPickup
);

router.post(
  "/orders/:orderId/finish",
  verifyProvider,
  refreshSession,
  providerController.markOrderFinished
);

router.get(
  "/orders",
  verifyProvider,
  refreshSession,
  providerController.getProviderOrders
);

router.put("/story", verifyProvider, refreshSession, setOrUpdateStory);
router.get("/story", verifyProvider, refreshSession, getMyStory);
router.delete(
  "/story",
  verifyProvider,
  refreshSession,
  providerController.deleteStory
);
router.post(
  "/group-orders",
  verifyProvider,
  refreshSession,
  providerController.createGroupOrder
);

router.get(
  "/group-orders",
  verifyProvider,
  refreshSession,
  providerController.getGroupOrders
);

module.exports = router;
