const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  verifyProvider,
} = require("../middleware/validators/provider/providerValidator");
const providerController = require("../controllers/providerController");
const { getMyStory } = require("../controllers/provider/getStory");
const setOrUpdateStory = require("../controllers/provider/setOrUpdateStory");

router.put(
  "/me",
  verifyProvider,
  upload.single("profile_image"),
  providerController.updateProfile
);

router.put("/story", verifyProvider, setOrUpdateStory);
router.get("/story", verifyProvider, getMyStory);
router.delete("/story", verifyProvider, providerController.deleteStory);
router.post(
  "/group-orders",
  verifyProvider,
  providerController.createGroupOrder
);

module.exports = router;
