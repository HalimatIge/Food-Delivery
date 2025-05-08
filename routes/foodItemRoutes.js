const express = require("express");
const {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
} = require("../controllers/foodItemcontroller");
const adminAuthorization = require("../middlewares/AdminAuthorization"); // Import the middleware

const foodItemRouter = express.Router();

// Apply admin authorization middleware to routes that require admin access
foodItemRouter.post("/add", adminAuthorization, createFoodItem); // Protect the route for adding food items
foodItemRouter.get("/", getAllFoodItems); // Public route for getting food items (no admin required)
foodItemRouter.get("/get/:id", getFoodItemById); // Public route for getting a specific food item (no admin required)
foodItemRouter.put("/update/:id", adminAuthorization, updateFoodItem); // Protect the route for updating food items
foodItemRouter.delete("/delete/:id", adminAuthorization, deleteFoodItem); // Protect the route for deleting food items

module.exports = foodItemRouter;
