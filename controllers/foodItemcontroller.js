const FoodItemModel = require("../models/foodItem.model");

// Create a new food item
const createFoodItem = async (req, res) => {
  try {
    const foodItem = new FoodItemModel(req.body); // Create a new food item using the request body
    await foodItem.save(); // Save the food item to the database

    res.status(201).send({
      status: true,
      message: "Food item created successfully",
      foodItem,
    });
  } catch (err) {
    console.error("Error creating food item:", err);
    res.status(500).send({
      status: false,
      message: "Something went wrong. Unable to create food item.",
    });
  }
};

// Get all food items
const getAllFoodItems = async (req, res) => {
  try {
    const foodItems = await FoodItemModel.find(); // Fetch all food items from the database

    if (foodItems.length === 0) {
      return res.status(404).send({
        status: false,
        message: "No food items found",
      });
    }

    res.status(200).send({
      status: true,
      message: "Food items retrieved successfully",
      foodItems,
    });
  } catch (err) {
    console.error("Error fetching food items:", err);
    res.status(500).send({
      status: false,
      message: "Something went wrong. Unable to fetch food items.",
    });
  }
};

// Get a single food item by its ID
const getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItemModel.findById(req.params.id); // Find food item by ID

    if (!foodItem) {
      return res.status(404).send({
        status: false,
        message: "Food item not found",
      });
    }

    res.status(200).send({
      status: true,
      message: "Food item retrieved successfully",
      foodItem,
    });
  } catch (err) {
    console.error("Error fetching food item:", err);
    res.status(500).send({
      status: false,
      message: "Something went wrong. Unable to fetch food item.",
    });
  }
};

// Update a food item by its ID
const updateFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItemModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Run validation for the updated fields
      }
    );

    if (!foodItem) {
      return res.status(404).send({
        status: false,
        message: "Food item not found",
      });
    }

    res.status(200).send({
      status: true,
      message: "Food item updated successfully",
      foodItem,
    });
  } catch (err) {
    console.error("Error updating food item:", err);
    res.status(500).send({
      status: false,
      message: "Something went wrong. Unable to update food item.",
    });
  }
};

// Delete a food item by its ID
const deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItemModel.findByIdAndDelete(req.params.id); // Delete food item by ID

    if (!foodItem) {
      return res.status(404).send({
        status: false,
        message: "Food item not found",
      });
    }

    res.status(200).send({
      status: true,
      message: "Food item deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting food item:", err);
    res.status(500).send({
      status: false,
      message: "Something went wrong. Unable to delete food item.",
    });
  }
};

module.exports = {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
};
