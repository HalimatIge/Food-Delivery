const express = require("express");
const {
  registerUser,
  signInUser,
  getDashboard,
} = require("../controllers/authController");
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/signin", signInUser);
userRouter.get("/dashboard", getDashboard);
module.exports = userRouter;
