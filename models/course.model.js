const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  tutor: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tutor" }],
  duration: {
    type: Number,
    required: [true, "Course duration is required"],
    min: [1, "Duration must be at least 1 hour"],
  },
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
