const express = require("express");
const {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
} = require("../controllers/foodItemcontroller");

const foodItemRouter = express.Router();
foodItemRouter.post("/add", createFoodItem);
foodItemRouter.get("/", getAllFoodItems);
foodItemRouter.get("/get/:id", getFoodItemById);
foodItemRouter.put("/update/:id", updateFoodItem);
foodItemRouter.delete("/delete/:id", deleteFoodItem);

module.exports = foodItemRouter;
