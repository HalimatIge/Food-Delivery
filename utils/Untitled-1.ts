const FoodItem = require("../models/foodItem.model");
const cloudinary = require("../utils/cloudinary");

// Create food item
exports.createFoodItem = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const images = [];
    for (const file of req.files.image) {
      const upload = await cloudinary.uploader.upload(file.path, {
        folder: "food_items",
      });
      images.push({
        public_id: upload.public_id,
        url: upload.secure_url,
        name: upload.original_filename,
      });
    }

    const newItem = await FoodItem.create({
      ...req.body,
      image: images,
    });

    res.status(201).json({ success: true, message: "Food item created", data: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update food item
exports.updateFoodItem = async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });

    // Remove old images from Cloudinary
    if (item.image && item.image.length > 0) {
      for (const img of item.image) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    const newImages = [];
    if (req.files?.image) {
      for (const file of req.files.image) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "food_items",
        });
        newImages.push({
          public_id: upload.public_id,
          url: upload.secure_url,
          name: upload.original_filename,
        });
      }
    }

    const updatedItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: newImages,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Updated", data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete food item
exports.deleteFoodItem = async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });

    // Delete images from Cloudinary
    if (item.image && item.image.length > 0) {
      for (const img of item.image) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await FoodItem.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all food items
exports.getAllFoodItems = async (req, res) => {
  try {
    const items = await FoodItem.find();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching food items" });
  }
};

// Get single food item
exports.getFoodItemById = async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
