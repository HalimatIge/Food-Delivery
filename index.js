const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());

// ✅ CORS setup to allow cookies from frontend
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true, // allow sending cookies
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => res.send("API Running fhh"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/foodItems", require("./routes/foodItemRoutes"));

// MongoDB and server start
const PORT = process.env.PORT || 5002;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:");
    console.error(err.message);
    process.exit(1);
  });
