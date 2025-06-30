const express = require("express");
const multer = require("multer");
const app = express();

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.array("images", 5), (req, res) => {
  res.send(`Received ${req.files.length} files`);
});

app.listen(3000, () => console.log("Test server running on 3000"));
