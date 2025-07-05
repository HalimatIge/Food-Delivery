const Order = require("../models/order.model");

// @desc    Create new order
const createOrder = async (req, res, next) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      fullName,
      phone,
      address,
      paymentMethod,
    } = req.body;

    if (
      !userId ||
      !items ||
      items.length === 0 ||
      !totalAmount ||
      !fullName ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete order data",
      });
    }

    const newOrder = await Order.create({
      userId,
      items,
      totalAmount,
      fullName,
      phone,
      address,
      paymentMethod,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get orders for a specific user
const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin only)
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All orders retrieved successfully",
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH update order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// const cancelOrder = async (req, res, next) => {
//   try {
//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     if (order.status !== "Pending") {
//       return res.status(400).json({
//         success: false,
//         message: "Only pending orders can be cancelled",
//       });
//     }

//     order.status = "Cancelled";
//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: "Order cancelled successfully",
//       data: order,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }
    // Check if already cancelled or delivered
    if (["Cancelled", "Delivered"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.status}`,
      });
    }

    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffInMinutes = Math.floor((now - createdAt) / 60000); // 60000 ms = 1 min

    if (diffInMinutes > 10) {
      return res.status(400).json({
        success: false,
        message: "You can only cancel an order within 10 minutes",
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
