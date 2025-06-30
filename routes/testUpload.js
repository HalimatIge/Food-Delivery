const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

app.use("/test", testUploadRouter); // Add this line FIRST
const testUploadRouter = require("./routes/testUpload");
// TEST ROUTE - NOTHING ELSE
router.post("/test", upload.array("images", 5), (req, res) => {
  res.json({
    receivedFiles: req.files ? req.files.length : 0,
    fileNames: req.files ? req.files.map((f) => f.originalname) : [],
  });
});

module.exports = router;
