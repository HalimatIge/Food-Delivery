const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
      name: String,
      price: Number,
      quantity: Number,
      images: Array,
    },
  ],
  totalAmount: { type: Number, required: true },

  // ✅ Add these extra fields
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  paymentMethod: {
    type: String,
    enum: ["Pay on Delivery", "Card", "delivered"],
    default: "Pay on Delivery",
  },

  status: {
    type: String,
    enum: [
      "Pending",
      "Processing",
      "Confirmed",
      "On the way",
      "Delivered",
      "Cancelled",
    ],
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
