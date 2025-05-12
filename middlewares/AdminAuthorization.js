// // adminMiddleware.js
// const jwt = require("jsonwebtoken");
// const UserModel = require("../models/user.model");

// const adminAuthorization = async (req, res, next) => {
//   try {
//     // Get the token from cookies or authorization header
//     const token =
//       req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//       return res.status(401).send({
//         status: false,
//         message: "Authorization token is required",
//       });
//     }

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key here
//     // const user = await UserModel.findById(decoded.userId);
//     const user = await UserModel.findById(decoded.id); // ✅ because your payload is: { id, email, role }

//     if (!user) {
//       return res.status(401).send({
//         status: false,
//         message: "User not found",
//       });
//     }

//     if (user.role !== "admin") {
//       return res.status(403).send({
//         status: false,
//         message: "Access denied. Admins only.",
//       });
//     }

//     req.user = user; // Attach the user to the request object
//     next(); // Proceed to the next middleware or route handler
//   } catch (err) {
//     console.error("Authorization error:", err);
//     res.status(500).send({
//       status: false,
//       message: "Internal server error during authorization",
//     });
//   }
// };

// module.exports = { adminAuthorization };
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const adminAuthorization = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ status: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user || user.role !== "admin")
      return res.status(403).json({ status: false, message: "Admins only" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ status: false, message: "Auth error" });
  }
};

const userAuthorization = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ status: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user || user.role !== "user")
      return res.status(403).json({ status: false, message: "Users only" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ status: false, message: "Auth error" });
  }
};

module.exports = { adminAuthorization, userAuthorization };
