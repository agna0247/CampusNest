
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    course: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    },
    phone: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
