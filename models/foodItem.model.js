const mongoose = require("mongoose");

const FoodItemSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Food name is required"] }, // Name of the food item
  description: { type: String, required: [true, "Description is required"] }, // Description of the food item
  price: { type: Number, required: [true, "Price is required"] }, // Price of the food item
  category: {
    type: String,
    enum: ["starter", "main", "dessert", "beverage", "appetizer", "special"], // Categories of food
    required: true,
  },
  images: [
    {
      public_id: {
        type: String,
        // required: true,
      },
      name: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: [true, 'file url (file_upload.url)'],
      },
    },
  ],
  // image: { type: String, required: [true, "Image URL is required"] }, // Image URL of the food item
  available: { type: Boolean, default: true }, // Availability status of the food item
  dateAdded: { type: Date, default: Date.now }, // Date when the food item was added to the menu
});

const FoodItemModel = mongoose.model("FoodItem", FoodItemSchema);
module.exports = FoodItemModel;
