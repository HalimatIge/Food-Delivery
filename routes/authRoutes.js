// const express = require("express");
// const {
//   registerUser,
//   signInUser,
//   refreshAccessToken,
//   getDashboard,
//   logOutUser,
//   verifyUserOnRefresh,
// } = require("../controllers/authController");

// const { protect } = require("../middlewares/authMiddleware");

// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/signin", signInUser);
// router.get("/refresh", refreshAccessToken);
// router.get("/dashboard", protect, getDashboard);
// router.post("/logout", logOutUser);
// router.get("/me", verifyUserOnRefresh); // Optional auto-login

// module.exports = router;
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
// const {
//   adminAuthorization,
//   userAuthorization,
// } = require("../middlewares/adminAuthorization");

const router = express.Router();

router.post("/register", registerUser);
router.post("/signin", signInUser);
router.get("/refresh", refreshAccessToken);
router.get("/dashboard", protect, getDashboard);
router.post("/logout", logout);
router.get("/admin-dashboard", adminAuthorization, getDashboard);
router.get("/user-dashboard", userAuthorization, getDashboard);
// router.get("/me", verifyUserOnRefresh); // Optional auto-login
// router.get("/me", verifyUserOnRefresh, async (req, res) => {
//   try {
//     const user = await User.findById(req.userId).select("-password");
//     if (!user) {
//       return res.status(404).json({ status: false, message: "User not found" });
//     }
//     res.status(200).json({ status: true, user });
//   } catch (err) {
//     res.status(500).json({ status: false, message: "Server error" });
//   }
// });

module.exports = router;
