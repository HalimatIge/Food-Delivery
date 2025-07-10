const FoodItemModel = require("../models/foodItem.model");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const createFoodItem = async (req, res) => {
  try {
    const images = req.files?.images || [];

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    // Upload to Cloudinary
    const fileUpload = [];

    for (const file of images) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "food_items",
        resource_type: "auto",
      });

      fileUpload.push({
        public_id: result.public_id,
        url: result.secure_url,
        name: result.original_filename || file.originalname,
      });

      // Cleanup temp file
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Failed to delete temp file:", err);
      }
    }

    // Create food item
    const newFood = await FoodItemModel.create({
      ...req.body,
      images: fileUpload,
    });

    res.status(201).json({ success: true, data: newFood });
  } catch (error) {
    console.error("Create Food Error:", error);

    // Clean up any uploaded temp files
    const fallbackFiles = req.files?.images || [];
    fallbackFiles.forEach((file) => {
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    });

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
const getAllFoodItems = async (req, res) => {
  try {
    const {
      category,
      search,
      popular,
      page = 1,
      limit = 8,
      sort = "dateAdded",
      order = "desc",
    } = req.query;

    const filter = { available: true };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (popular === "true") {
      filter.isPopular = true;
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    const [foodItems, total] = await Promise.all([
      FoodItemModel.find(filter)
        .sort({ [sort]: sortOrder })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      FoodItemModel.countDocuments(filter),
    ]);

    res.status(200).json({
      status: true,
      message: "Food items retrieved successfully",
      count: foodItems.length,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      foodItems,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message || "Database operation failed",
    });
  }
};

// const getAllFoodItems = async (req, res) => {
//   try {
//     const { category } = req.query;
//     const filter = category && category !== "all" ? { category } : {};

//     const foodItems = await FoodItemModel.find(filter).lean();

//     if (!foodItems || foodItems.length === 0) {
//       return res.status(404).json({
//         status: false,
//         message: "No food items found for this category",
//       });
//     }

//     res.status(200).json({
//       status: true,
//       message: "Food items retrieved successfully",
//       count: foodItems.length,
//       foodItems,
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: false,
//       message: err.message || "Database operation failed",
//     });
//   }
// };

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
    let updatedImages = [];

    // ✅ Retain existing images if provided
    if (req.body.existingImages) {
      updatedImages = JSON.parse(req.body.existingImages);
    }

    // ✅ Upload new images if available
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images]; // Handle single or multiple files

      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "food-images",
        });

        updatedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // ✅ Update food item in DB
    const updatedFood = await FoodItemModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        description: req.body.description,
        available: req.body.available === "true",
        images: updatedImages,
      },
      { new: true, runValidators: true }
    );

    if (!updatedFood) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Food item updated successfully",
      data: updatedFood,
    });
  } catch (error) {
    console.error("Error updating food item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update food item",
      error: error.message,
    });
  }
};

// Delete a food item by its ID

const deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItemModel.findById(req.params.id);
    if (!foodItem) return res.status(404).json({ error: "Not found" });

    // Optional: delete Cloudinary images using public_id
    for (const image of foodItem.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }
    await foodItem.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete food item" });
  }
};

module.exports = {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
};
