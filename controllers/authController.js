// ======= authController.js =======
const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) =>
  jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const registerUser = async (req, res) => {
  try {
    const newUser = new UserModel(req.body);
    await newUser.save();
    res
      .status(201)
      .json({ status: true, message: "User registered successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ status: false, message: "Email already in use" });
    } else {
      res.status(500).json({ status: false, message: "Registration failed" });
    }
  }
};

const signInUser = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(401)
        .json({ status: false, message: "Wrong email or password" });

    user.validatePassword(req.body.password, (err, same) => {
      if (err || !same)
        return res
          .status(401)
          .json({ status: false, message: "Wrong email or password" });

      const payload = { id: user._id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 1000 * 60 * 15,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ status: true, message: "Login successful", user });
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
};

const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 1000 * 60 * 15,
    });

    res.json({ message: "Access token refreshed" });
  });
};

const getDashboard = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Dashboard loaded", user });
  } catch (err) {
    res.status(500).json({ message: "Error loading dashboard" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false, // set to true in production
  });
  return res.json({ message: "Logged out successfully" });
};

const verifyUserOnRefresh = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ status: false, message: "Not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
};

module.exports = {
  registerUser,
  signInUser,
  refreshAccessToken,
  getDashboard,
  logout,
  verifyUserOnRefresh,
};

// const UserModel = require("../models/user.model");
// const jwt = require("jsonwebtoken");

// // Generate tokens
// const generateAccessToken = (user) =>
//   jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });

// const generateRefreshToken = (user) =>
//   jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

// // Register
// const registerUser = async (req, res) => {
//   try {
//     const newUser = new UserModel(req.body);
//     await newUser.save();
//     res
//       .status(201)
//       .json({ status: true, message: "User registered successfully!" });
//   } catch (err) {
//     if (err.code === 11000) {
//       res.status(409).json({ status: false, message: "Email already in use" });
//     } else {
//       res.status(500).json({ status: false, message: "Registration failed" });
//     }
//   }
// };

// // Sign in
// const signInUser = async (req, res) => {
//   try {
//     const user = await UserModel.findOne({ email: req.body.email });
//     if (!user)
//       return res
//         .status(401)
//         .json({ status: false, message: "Wrong email or password" });

//     user.validatePassword(req.body.password, (err, same) => {
//       if (err || !same)
//         return res
//           .status(401)
//           .json({ status: false, message: "Wrong email or password" });

//       const payload = { id: user._id, email: user.email, role: user.role };

//       const accessToken = generateAccessToken(payload);
//       const refreshToken = generateRefreshToken(payload);

//       res.cookie("token", accessToken, {
//         httpOnly: true,
//         secure: false,
//         sameSite: "Lax",
//         maxAge: 1000 * 60 * 15, // 15 min
//       });

//       res.cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: false,
//         sameSite: "Lax",
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       });

//       res.status(200).json({ status: true, message: "Login successful", user });
//     });
//   } catch (err) {
//     res.status(500).json({ status: false, message: "Server error" });
//   }
// };

// // Refresh token
// const refreshAccessToken = (req, res) => {
//   const refreshToken = req.cookies.refreshToken;
//   if (!refreshToken)
//     return res.status(401).json({ message: "No refresh token" });

//   jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: "Invalid refresh token" });

//     const newAccessToken = generateAccessToken({
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     });

//     res.cookie("token", newAccessToken, {
//       httpOnly: true,
//       secure: false,
//       sameSite: "Lax",
//       maxAge: 1000 * 60 * 15,
//     });

//     res.json({ message: "Access token refreshed" });
//   });
// };

// // Dashboard (protected)
// const getDashboard = async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.user.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ message: "Dashboard loaded", user: req.user });
//   } catch (err) {
//     res.status(500).json({ message: "Error loading dashboard" });
//   }
// };

// // Logout
// const logOutUser = (req, res) => {
//   res.clearCookie("token");
//   res.clearCookie("refreshToken");
//   return res.json({ status: true, message: "Logged out" });

//   // res.json({ message: "Logged out successfully" });
// };

// // Auto login on refresh
// const verifyUserOnRefresh = (req, res) => {
//   const token = req.cookies.token;
//   if (!token) return res.json({ status: false });

//   // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//   //   if (err) return res.json({ status: false });
//   //   return res.json({ status: true, user: decoded });
//   // });
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ status: false, message: "Invalid token" });
//   }
// };

// module.exports = {
//   registerUser,
//   signInUser,
//   refreshAccessToken,
//   getDashboard,
//   logOutUser,
//   verifyUserOnRefresh,
// };
