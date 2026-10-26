
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const feedbackSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseDuration: { type: String, required: true },
  comments: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

app.get("/api/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

app.post("/api/feedback", async (req, res) => {
  try {
    const { courseName, courseDuration, comments, rating } = req.body;
    if (!courseName || !courseDuration || !comments || rating == null) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    const feedback = await Feedback.create({
      courseName, courseDuration, comments, rating
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: "Could not add feedback" });
  }
});

app.put("/api/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ message: "Could not update feedback" });
  }
});

app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Could not delete feedback" });
  }
});

app.get("/", (req, res) => {
  res.send("Feedback Admin API is running!");
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
