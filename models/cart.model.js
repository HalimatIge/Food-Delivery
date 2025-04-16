const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Food name is required"] }, // Name of the food item
  description: { type: String, required: [true, "Description is required"] }, // Description of the food item
  price: { type: Number, required: [true, "Price is required"] }, // Price of the food item
  category: {
    type: String,
    enum: ["starter", "main", "dessert", "beverage"], // Categories of food
    required: true,
  },
  image: { type: String, required: [true, "Image URL is required"] }, // Image URL of the food item
  available: { type: Boolean, default: true }, // Availability status of the food item
  dateAdded: { type: Date, default: Date.now }, // Date when the food item was added to the menu
});

let CartModel = mongoose.model("Cart", CartSchema);
module.exports = CartModel;
