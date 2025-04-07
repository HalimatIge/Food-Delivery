const mongoose = require("mongoose");
let bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: [true, "Firstname field is required"] },
  lastname: { type: String, required: [true, "Lastname field is required"] },
  email: {
    type: String,
    required: [true, "Email field is required"],
    unique: [true, "Email already exist"],
  },
  password: { type: String, required: [true, "Password field is required"] },
  date: { type: Date, default: Date.now },
});

//hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.log("Error hashing password:", error);
    next(error);
  }
});

//validate password method
// Validate password method (Fix the callback)
UserSchema.methods.validatePassword = function (password, callback) {
  console.log("📥 Incoming Password:", password);
  console.log("🔐 Hashed Password in DB:", this.password);

  bcrypt.compare(password, this.password, (err, same) => {
    if (err) {
      console.log("❌ Error comparing passwords:", err);
      return callback(err, false);
    }

    console.log("✅ Passwords match?", same);
    callback(null, same);
  });
};

let UserModel = mongoose.model("users_collection", UserSchema);
module.exports = UserModel;
