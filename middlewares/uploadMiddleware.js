const multer = require("multer");

// SIMPLEST POSSIBLE CONFIGURATION
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Verify the instance is created properly
console.log("Multer instance created successfully:", !!upload);
console.log("Array method exists:", typeof upload.array === "function");

module.exports = upload;

// const multer = require("multer");
// const path = require("path");

// const storage = multer.memoryStorage();

// // File filter
// const fileFilter = (req, file, cb) => {
//   const filetypes = /jpeg|jpg|png|webp/;
//   const mimetype = filetypes.test(file.mimetype);
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//   if (mimetype && extname) {
//     return cb(null, true);
//   }
//   cb(new Error("Only image files are allowed (JPEG, JPG, PNG, WEBP)"));
// };

// // Create base upload configuration
// // const upload = multer({
// //   storage,
// //   fileFilter,
// //   limits: {
// //     fileSize: 5 * 1024 * 1024, // 5MB per file
// //   },
// // });

// // In your multer config (middleware/uploadMiddleware.js)
// const upload = multer({
//   storage: multer.memoryStorage(), // Files will be in memory as buffers
//   fileFilter: (req, file, cb) => {
//     // Your existing file filter
//   },
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// }).array("images", 5); // Supports 1-5 images

// // Export different upload handlers
// exports.uploadFoodImages = upload.array("images", 5); // Accepts 1-5 images in "images" field
// exports.uploadSingleFoodImage = upload.single("image"); // Alternative single upload
