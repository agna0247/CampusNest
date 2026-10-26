
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Student from "./models/Student.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("CampusNest API is running!");
});

// Get all students and search students
app.get("/api/students", async (req, res) => {
  try {
    const search = req.query.search || "";

    const students = await Student.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a student
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({
      message:
        error.code === 11000
          ? "This email already exists"
          : error.message
    });
  }
});

// Update a student
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Start the server
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the backend .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`CampusNest server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
}

startServer();
