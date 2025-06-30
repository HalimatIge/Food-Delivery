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
    const foodItems = await FoodItemModel.find().lean();
    if (!foodItems || foodItems.length === 0) {
      return res.status(404).send({
        status: false,
        message: "No food items found",
      });
    }
    res.status(200).send({
      status: true,
      message: "Food items retrieved successfully",
      count: foodItems.length, // Helpful metadata
      foodItems,
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: err.message || "Database operation failed",
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

// const updateFoodItem = async (req, res) => {
//   try {
//     const foodItem = await FoodItemModel.findById(req.params.id);
//     if (!foodItem)
//       return res.status(404).json({ message: "Food item not found" });

//     // Parse the text fields
//     const { name, price, category, description } = req.body;
//     foodItem.name = name;
//     foodItem.price = price;
//     foodItem.category = category;
//     foodItem.description = description;

//     // Handle images:
//     let finalImages = [];

//     // Parse and retain existing images (from frontend)
//     if (req.body.existingImages) {
//       const existingImages = JSON.parse(req.body.existingImages);
//       finalImages = [...existingImages];
//     }

//     // Add new uploaded images (if any)
//     if (req.files?.length > 0) {
//       const newImages = req.files.map((file) => ({
//         url: `/uploads/${file.filename}`, // or Cloudinary URL
//         name: file.originalname,
//         public_id: file.filename, // or Cloudinary public_id
//       }));
//       finalImages = [...finalImages, ...newImages];
//     }

//     foodItem.images = finalImages;

//     await foodItem.save();

//     res
//       .status(200)
//       .json({ message: "Food item updated successfully", foodItem });
//   } catch (err) {
//     console.error("Update error:", err);
//     res.status(500).json({ message: "Failed to update food item" });
//   }
// };

// const updateFoodItem = async (req, res) => {
//   try {
//     const { id } = req.params;

//     let foodItem = await FoodItemModel.findById(id);
//     if (!foodItem) {
//       return res.status(404).json({
//         success: false,
//         message: `Food item with ID ${id} not found`,
//       });
//     }

//     let uploadedImages = [];

//     // If new images are uploaded
//     if (req.files && req.files.images) {
//       const files = Array.isArray(req.files.images)
//         ? req.files.images
//         : [req.files.images];

//       for (const file of files) {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "food_items",
//         });

//         uploadedImages.push({
//           public_id: result.public_id,
//           url: result.secure_url,
//         });
//       }
//     }

//     // Use existing images if no new images uploaded
//     if (uploadedImages.length === 0 && req.body.existingImages) {
//       uploadedImages = JSON.parse(req.body.existingImages);
//     }

//     const updateData = {
//       name: req.body.name || foodItem.name,
//       price: req.body.price || foodItem.price,
//       category: req.body.category || foodItem.category,
//       description: req.body.description || foodItem.description,
//       available:
//         req.body.available !== undefined
//           ? req.body.available
//           : foodItem.available,
//       images: uploadedImages,
//     };

//     const updatedFood = await FoodItemModel.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Food item updated successfully",
//       data: updatedFood,
//     });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while updating the food item",
//     });
//   }
// };

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
