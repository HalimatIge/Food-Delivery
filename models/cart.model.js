// models/Cart.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  cart: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
      name: String,
      price: Number,
      quantity: Number,
      images: Array,
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
