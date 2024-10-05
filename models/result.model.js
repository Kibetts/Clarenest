const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      required: [true, "Subject is required"],
    },
    examDate: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    grades: [
      {
        assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
        grade: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;
