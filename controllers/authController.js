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

// Function for user sign-in
// const signInUser = async (req, res) => {
//   console.log("Sign-in request:", req.body); // Log the sign-in request

//   try {
//     // Find user by email
//     const user = await UserModel.findOne({ email: req.body.email });

//     // If user not found, return error
//     if (!user) {
//       console.log("User not found in database.");
//       return res.send({ status: false, message: "Wrong Email or Password" });
//     }

//     // Validate entered password against the hashed password in the DB
//     user.validatePassword(req.body.password, (err, same) => {
//       if (err) {
//         console.log("Password comparison error:", err);
//         return res.send({ status: false, message: "Something went wrong" });
//       }

//       if (!same) {
//         console.log("Wrong email or password");
//         return res.send({ status: false, message: "Wrong Email or Password" });
//       }

//       console.log("User successfully authenticated:", user.email);

//       // Create JWT token with the user's email and role
//       let token = jwt.sign(
//         { email: req.body.email, role: user.role },
//         "secret",
//         {
//           expiresIn: "1h", // Token will expire in 1 hour
//         }
//       );
//       res.send({ status: true, message: "Sign In successful", token });
//     });
//   } catch (err) {
//     console.log("Error finding user:", err); // Log any errors in sign-in
//     res.send({ status: false, message: "Something went wrong" });
//   }
// };

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
      const token = jwt.sign({ email: user.email, role: user.role }, "secret", {
        expiresIn: "1h",
      });

      // ✅ Set token as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        // secure: process.env.NODE_ENV === "production", // set true in production
        sameSite: "Lax", // or "None" if frontend & backend are on different domains AND using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 1 day
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

// Function to get user dashboard information (requires authentication)
// const getDashboard = (req, res) => {
//   // Get token from the request headers
//   const token = req.headers.authorization?.split(" ")[1];

//   // If no token is provided, return an error
//   if (!token) {
//     return res.send({ status: false, message: "No token provided" });
//   }

//   // Verify the token
//   jwt.verify(token, "secret", (err, result) => {
//     if (err) {
//       console.log("Token error:", err);
//       return res.send({
//         status: false,
//         message: "Session expired, kindly sign in",
//       });
//     }

//     const email = result.email; // Get the email from the token
//     // Find the user in the database by email
//     UserModel.findOne({ email: email })
//       .then((user) => {
//         if (!user) {
//           return res.send({ status: false, message: "User not found" });
//         }

//         // Respond with the user data if found
//         res.send({ status: true, message: "Successful", user });
//       })
//       .catch((err) => {
//         console.log("DB Error:", err);
//         res.send({ status: false, message: "Database error" });
//       });
//   });
// };

const getDashboard = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .send({ status: false, message: "No token provided" });
  }

  jwt.verify(token, "secret", (err, result) => {
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

// Export the controller functions
module.exports = { registerUser, signInUser, getDashboard };
