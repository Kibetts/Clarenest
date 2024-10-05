const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
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
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  assignmentsCompleted: {
    type: Number,
    default: 0,
  },
  gradeAverage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  remarks: {
    type: String,
    maxlength: 250,
  },
});

const Progress = mongoose.model("Progress", progressSchema);
module.exports = Progress;
