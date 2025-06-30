const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodItem.controller");
const { adminAuthorization } = require("../middlewares/adminAuthorization");
const upload = require("../middlewares/multer");

router.post(
  "/add",
  adminAuthorization,
  upload.fields([{ name: "image", maxCount: 5 }]),
  foodController.createFoodItem
);
router.get("/", foodController.getAllFoodItems);
router.get("/:id", foodController.getFoodItemById);
router.put(
  "/update/:id",
  adminAuthorization,
  upload.fields([{ name: "image", maxCount: 5 }]),
  foodController.updateFoodItem
);
router.delete("/delete/:id", adminAuthorization, foodController.deleteFoodItem);

module.exports = router;
