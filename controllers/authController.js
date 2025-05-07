const UserModel = require("../models/user.model"); // Import User model
const jwt = require("jsonwebtoken"); // Import JWT for token generation
require("dotenv").config();

// Function to register a new user
const registerUser = async (req, res) => {
  console.log("Received request body:", req.body); // Log incoming request

  try {
    const form = new UserModel(req.body); // Create a new user using the request body
    await form.save(); // Save user to the database

    console.log("Data saved successfully:", form); // Log success
    res.send({ status: true, message: "User registered successfully!" }); // Send success response
  } catch (err) {
    console.log("Error saving user:", err); // Log any errors

    // Handle duplicate email error
    if (err.code === 11000) {
      res.send({ status: false, message: "Email already in use" });
    } else {
      res.send({ status: false, message: "Something went wrong" });
    }
  }
};

const signInUser = async (req, res) => {
  console.log("Sign-in request:", req.body);

  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      console.log("User not found in database.");
      return res.send({ status: false, message: "Wrong Email or Password" });
    }

    user.validatePassword(req.body.password, (err, same) => {
      if (err) {
        console.log("Password comparison error:", err);
        return res.send({ status: false, message: "Something went wrong" });
      }

      if (!same) {
        console.log("Wrong email or password");
        return res.send({ status: false, message: "Wrong Email or Password" });
      }

      console.log("User successfully authenticated:", user.email);

      // ✅ Create JWT token
      const token = jwt.sign(
        { email: user.email, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "4h",
        }
      );

      // ✅ Set token as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        path: "/",
        // secure: process.env.NODE_ENV === "production", // set true in production
        sameSite: "Lax", // or "None" if frontend & backend are on different domains AND using HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // ✅ Return success
      // res.send({ status: true, message: "Sign In successful" });
      res.status(200).json({ status: true, message: "Login successful", user });
    });
  } catch (err) {
    console.log("Error finding user:", err);
    res.send({ status: false, message: "Something went wrong" });
  }
};

const getDashboard = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .send({ status: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
    if (err) {
      console.log("Token error:", err);
      return res.status(401).send({
        status: false,
        message: "Session expired, kindly sign in",
      });
    }

    const email = result.email;

    UserModel.findOne({ email })
      .then((user) => {
        if (!user) {
          return res
            .status(404)
            .send({ status: false, message: "User not found" });
        }

        res.send({ status: true, message: "Successful", user });
      })
      .catch((err) => {
        console.log("DB Error:", err);
        res.status(500).send({ status: false, message: "Database error" });
      });
  });
};
const logOutUser = (req, res) => {
  res.clearCookie(process.env.JWT_SECRET, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
};

const verifyUseronRefresh = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ status: false });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.json({ status: false });
    return res.json({ status: true, user: decoded });
  });
};

// Export the controller functions
module.exports = {
  registerUser,
  signInUser,
  getDashboard,
  logOutUser,
  verifyUseronRefresh,
};
