const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    status: { type: String, enum: ["Present", "Absent"], required: true },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Attendance date cannot be in the future",
      },
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
