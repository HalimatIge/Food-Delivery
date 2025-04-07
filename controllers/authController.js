const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register User
const registerUser = async (req, res) => {
  console.log("Received request body:", req.body);

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.send({ status: false, message: "Email already in use" });
    }

    // Hash password before saving
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new user with hashed password
    // const form = new UserModel({ ...req.body, password: hashedPassword });
    const form = new UserModel(req.body);

    await form.save();

    console.log("User registered successfully:", form);
    res.send({ status: true, message: "User registered successfully!" });
  } catch (err) {
    console.log("Error saving user:", err);
    res.send({ status: false, message: "Something went wrong" });
  }
};

// Sign In User
const signInUser = async (req, res) => {
  console.log("Sign-in request:", req.body);

  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      console.log("❌ Email not found in database.");
      return res.send({ status: false, message: "Wrong Email or Password" });
    }

    user.validatePassword(req.body.password, (err, same) => {
      if (err) {
        console.log("❌ Error comparing passwords:", err);
        return res.send({ status: false, message: "Something went wrong" });
      }

      if (!same) {
        console.log("❌ Password doesn't match.");
        return res.send({ status: false, message: "Wrong Email or Password" });
      }

      console.log("✅ Login successful for:", user.email);
      let token = jwt.sign({ email: req.body.email }, "secret", {
        expiresIn: "1h",
      });

      res.send({ status: true, message: "Sign In successful", token });
    });
  } catch (err) {
    console.log("❌ SignIn error:", err);
    res.send({ status: false, message: "Something went wrong" });
  }
};

// Get User Dashboard (Protected Route)
const getDashboard = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.send({ status: false, message: "No token provided" });
  }

  jwt.verify(token, "secret", (err, result) => {
    if (err) {
      console.log("Token error:", err);
      return res.send({
        status: false,
        message: "Session expired, kindly sign in",
      });
    }

    const email = result.email;
    UserModel.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.send({ status: false, message: "User not found" });
        }

        res.send({ status: true, message: "Successful", user });
      })
      .catch((err) => {
        console.log("DB Error:", err);
        res.send({ status: false, message: "Database error" });
      });
  });
};

module.exports = { registerUser, signInUser, getDashboard };
