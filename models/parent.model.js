
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const parentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: {
      validator: function (v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["parent"],
    default: "parent",
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  ],
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{10,15}$/.test(v); // Validates a phone number of 10-15 digits
      },
      message: "Please enter a valid phone number",
    },
  },
  finances: {
    feesPaid: { type: Number, default: 0 },
    arrears: { type: Number, default: 0 },
  },
  notifications: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
  ],
});

parentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

parentSchema.methods.isPasswordValid = function (password) {
  return bcrypt.compare(password, this.password);
};

const Parent = mongoose.model("Parent", parentSchema);
module.exports = Parent;
