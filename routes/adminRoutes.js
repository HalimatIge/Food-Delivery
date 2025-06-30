const { Router } = require("express");
const {
  createProperty,
  getProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
  getPropertiesByLocation,
  getPropertiesByType,
} = require("../src/realestateasset/realestatreassetController");

const multer = require("multer");

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Save images in the "public/uploads" folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix); // Generate unique file name
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter }).fields([{ name: "image" }]);

const propertyRouter = Router({ mergeParams: true });

// Route to get properties by location
propertyRouter.route("/propertiesByLocation").get(getPropertiesByLocation);

// Route to get properties by type
propertyRouter.route("/propertiesByType").get(getPropertiesByType);

// Routes for CRUD operations
propertyRouter.route("/")
  .get(getAllProperties)
  .post(upload, createProperty); // ✅ Correct usage of upload middleware

propertyRouter.route("/:propertyId")
  .get(getProperty)
  .patch(upload, updateProperty) // ✅ Ensure images can be updated
  .delete(deleteProperty);

module.exports = propertyRouter;
