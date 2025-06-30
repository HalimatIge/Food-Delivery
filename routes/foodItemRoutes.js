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

// foodItemRouter.post(
//   "/add",
//   (req, res, next) => {
//     uploadFoodImages(req, res, (err) => {
//       if (err) {
//         // Handle specific errors
//         if (err.code === "LIMIT_FILE_SIZE") {
//           return res
//             .status(413)
//             .json({ error: "File too large (max 5MB each)" });
//         }
//         if (err.code === "LIMIT_FILE_COUNT") {
//           return res.status(400).json({ error: "Maximum 5 images allowed" });
//         }
//         if (err.message.includes("image files")) {
//           return res
//             .status(415)
//             .json({ error: "Only JPEG/JPG/PNG/WEBP allowed" });
//         }
//         return res.status(400).json({ error: "File upload failed" });
//       }
//       next();
//     });
//   },
//   adminAuthorization,
//   createFoodItem
// );
foodItemRouter.get("/", getAllFoodItems); // Public route for getting food items (no admin required)
foodItemRouter.get("/:id", getFoodItemById); // Public route for getting a specific food item (no admin required)
foodItemRouter.put("/:id", adminAuthorization, upload, updateFoodItem); // Protect the route for updating food items
foodItemRouter.delete("/:id", adminAuthorization, deleteFoodItem); // Protect the route for deleting food items

module.exports = foodItemRouter;
