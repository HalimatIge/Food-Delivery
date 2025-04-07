const mongoose = require("mongoose");
let bcrypt = require("bcryptjs");

// Define the user schema
const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: [true, "Firstname field is required"] }, // User's first name
  lastname: { type: String, required: [true, "Lastname field is required"] }, // User's last name
  email: {
    type: String,
    required: [true, "Email field is required"], // Email is mandatory
    unique: [true, "Email already exist"], // Ensure email is unique
  },
  password: { type: String, required: [true, "Password field is required"] }, // User's password
  role: {
    type: String,
    enum: ["customer", "admin"], // Role can either be 'customer' or 'admin'
    default: "customer", // Default role is 'customer'
  },
  date: { type: Date, default: Date.now }, // Date of account creation
  // });
});

// Middleware to hash the password before saving to the database
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if modified

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.log("Error hashing password:", error); // Log any errors in hashing
    next(error); // Pass error to next middleware
  }
});

// Instance method to validate the password
UserSchema.methods.validatePassword = function (password, callback) {
  // Compare the entered password with the hashed password in the database
  bcrypt.compare(password, this.password, (err, same) => {
    if (err) return callback(err, false); // Pass error if comparison fails
    callback(null, same); // `same` will be true if passwords match
  });
};

let UserModel = mongoose.model("users_collection", UserSchema);
module.exports = UserModel;
