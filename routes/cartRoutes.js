// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const { saveCart, getCart } = require("../controllers/cartController");

// Save or update cart
router.post("/:userId", saveCart);

// Get cart
router.get("/:userId", getCart);

module.exports = router;
