const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 500,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.assignedDate;
        },
        message: "Due date must be after the assigned date",
      },
    },
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        file: { type: String },
        grade: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = Assignment;
