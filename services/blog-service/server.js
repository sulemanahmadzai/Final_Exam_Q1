const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { validateToken } = require("./middleware/auth");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const blogRoutes = require("./routes/blogs");

// Use routes
app.use("/api/blogs", validateToken, blogRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "blog-service" });
});

// Readiness check endpoint
app.get("/ready", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res
        .status(503)
        .json({ status: "error", message: "Database not connected" });
    }
    res.status(200).json({ status: "ok", message: "Service is ready" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === "test"
        ? "mongodb://localhost:27017/blog-service-test"
        : process.env.MONGO_URI;

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Only start the server if not in test environment
if (process.env.NODE_ENV !== "test") {
  connectDB();
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Blog service is running on port ${PORT}`);
  });
}

module.exports = app;
