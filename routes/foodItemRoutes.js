const express = require("express");
const {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
} = require("../controllers/foodItemcontroller");

const foodItemRouter = express.Router();
foodItemRouter.post("/", createFoodItem);
foodItemRouter.get("/", getAllFoodItems);
foodItemRouter.get("/:id", getFoodItemById);
foodItemRouter.put("/:id", updateFoodItem);
foodItemRouter.delete("/:id", deleteFoodItem);

module.exports = foodItemRouter;
