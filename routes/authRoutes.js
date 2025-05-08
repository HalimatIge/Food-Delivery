const express = require("express");
const {
  registerUser,
  signInUser,
  refreshAccessToken,
  getDashboard,
  logOutUser,
  verifyUserOnRefresh,
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/signin", signInUser);
router.get("/refresh", refreshAccessToken);
router.get("/dashboard", protect, getDashboard);
router.post("/logout", logOutUser);
router.get("/me", verifyUserOnRefresh); // Optional auto-login

module.exports = router;
