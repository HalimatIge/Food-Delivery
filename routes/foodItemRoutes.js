const express = require("express");
const {
  // upload,
  uploadFoodImages,
  uploadSingleFoodImage,
} = require("../middlewares/uploadMiddleware");
const upload = require("../config/multer"); // Import from new config

const {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
} = require("../controllers/foodItemcontroller");
const { adminAuthorization } = require("../middlewares/adminAuthorization");

const foodItemRouter = express.Router();

// Should be true

foodItemRouter.post("/add", adminAuthorization, upload, createFoodItem);

foodItemRouter.get("/", getAllFoodItems); // Public route for getting food items (no admin required)
foodItemRouter.get("/:id", getFoodItemById); // Public route for getting a specific food item (no admin required)
foodItemRouter.put("/:id", adminAuthorization, upload, updateFoodItem); // Protect the route for updating food items
foodItemRouter.delete("/:id", adminAuthorization, deleteFoodItem); // Protect the route for deleting food items

module.exports = foodItemRouter;
