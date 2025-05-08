// adminMiddleware.js
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const AdminAuthorization = async (req, res, next) => {
  try {
    // Get the token from cookies or authorization header
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).send({
        status: false,
        message: "Authorization token is required",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key here
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).send({
        status: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).send({
        status: false,
        message: "Access denied. Admins only.",
      });
    }

    req.user = user; // Attach the user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Authorization error:", err);
    res.status(500).send({
      status: false,
      message: "Internal server error during authorization",
    });
  }
};

module.exports = AdminAuthorization;
