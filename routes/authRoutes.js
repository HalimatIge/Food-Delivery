const express = require("express");
const {
  registerUser,
  signInUser,
  getDashboard,
  logOutUser,verifyUseronRefresh
} = require("../controllers/authController");
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/signin", signInUser);
userRouter.get("/dashboard", getDashboard);
userRouter.post("/logout", logOutUser);
userRouter.get("/me", verifyUseronRefresh);
module.exports = userRouter;
