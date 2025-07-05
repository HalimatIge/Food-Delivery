const express = require("express");
const {
  registerUser,
  signInUser,
  refreshAccessToken,
  getDashboard,
  logout,
  verifyUserOnRefresh,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  adminAuthorization,
  userAuthorization,
} = require("../middlewares/adminAuthorization");

const router = express.Router();

router.post("/register", registerUser);
router.post("/signin", signInUser);
router.get("/refresh", refreshAccessToken);
router.get("/dashboard", protect, getDashboard);
router.post("/logout", logout);
router.get("/admin-dashboard", adminAuthorization, getDashboard);
router.get("/user-dashboard", userAuthorization, getDashboard);

module.exports = router;
