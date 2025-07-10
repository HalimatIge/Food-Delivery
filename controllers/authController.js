// controllers/authController.js
const UserModel = require("../models/user.model");
const Otp = require("../models/otp.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
let bcrypt = require("bcryptjs");

const generateAccessToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) =>
  jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

// ========== Send OTP ============
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit number as string

    await Otp.deleteMany({ email }); // Remove any existing OTPs
    await Otp.create({ email, otp });

    console.log(`Generated OTP for ${email}: ${otp}`); // Optional: remove in production

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"QuickPlate" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `<p style="font-size: 16px;">Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("Send OTP error:", err.message);
    return res.status(500).json({ message: "Server error sending OTP" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    // Find the latest OTP (cast to Number to match DB type)
    const validOtp = await Otp.findOne({ email, otp: Number(otp) }).sort({
      createdAt: -1,
    });

    if (!validOtp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // OPTIONAL: Delete OTP after verification
    // await Otp.deleteMany({ email });

    // If it gets here, OTP is valid
    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    return res.status(500).json({ message: "Server error verifying OTP" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    await Otp.deleteMany({ email }); // Clean up OTPs

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error resetting password" });
  }
};

const sendForgotPasswordOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000);

  await Otp.create({ email, otp });

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"QuickPlate" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Reset Password OTP",
    html: `<p>Your password reset OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) return res.status(500).json({ message: "Email failed" });
    res.status(200).json({ success: true, message: "OTP sent" });
  });
};

const registerUser = async (req, res) => {
  const { firstname, lastname, email, password, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const newUser = await UserModel.create({
      firstname,
      lastname,
      email,
      password,
    });

    await Otp.deleteMany({ email }); // Clean OTPs after success

    res.status(201).json({
      status: true,
      message: "Registration successful",
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========== Sign In ============
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

// ========== Refresh Token ============
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

// ========== Dashboard ============
const getDashboard = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Dashboard loaded", user });
  } catch (err) {
    res.status(500).json({ message: "Error loading dashboard" });
  }
};

// ========== Logout ============
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false, // set to true in production
  });
  return res.json({ message: "Logged out successfully" });
};

// ========== Middleware ============
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

const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, currentPassword, newPassword } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update name or phone
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // If user is trying to change password
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      user.password = newPassword;
    }

    await user.save();

    const { password, ...userWithoutPassword } = user._doc;
    res.status(200).json({
      success: true,
      message: "Profile updated",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  signInUser,
  refreshAccessToken,
  getDashboard,
  logout,
  verifyUserOnRefresh,
  sendOtp,
  verifyOtp,
  resetPassword,
  sendForgotPasswordOtp,
  updateUserProfile,
};
