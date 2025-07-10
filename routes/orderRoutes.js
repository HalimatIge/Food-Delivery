const express = require("express");
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const orderRouter = express.Router();

// POST /api/orders — Place new order
orderRouter.post("/", createOrder);

// GET /api/orders/:userId — Get orders by user
orderRouter.get("/:userId", getUserOrders);

// (optional) GET /api/orders — Get all orders (admin only)
orderRouter.get("/", getAllOrders);

orderRouter.patch("/:orderId/status", updateOrderStatus); // Admin - Update order status

orderRouter.put("/:id/cancel", cancelOrder); // New cancel route

orderRouter.put("/:orderId/status", updateOrderStatus);

module.exports = orderRouter;
