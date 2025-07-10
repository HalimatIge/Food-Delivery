const express = require("express");
const {
  registerUser,
  signInUser,
  refreshAccessToken,
  getDashboard,
  logout,
  verifyUserOnRefresh,
  sendOtp,
  verifyOtp,
  resetPassword,
  sendForgotPasswordOtp,
  // verifyToken,
  updateUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  adminAuthorization,
  userAuthorization,
} = require("../middlewares/adminAuthorization");

const router = express.Router();
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);
router.post("/signin", signInUser);
router.get("/refresh", refreshAccessToken);
router.get("/dashboard", protect, getDashboard);
router.post("/logout", logout);
router.get("/admin-dashboard", adminAuthorization, getDashboard);
router.get("/user-dashboard", userAuthorization, getDashboard);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/reset", resetPassword);
router.put("/update-profile", protect, updateUserProfile);

module.exports = router;
