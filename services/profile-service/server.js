const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const profileRoutes = require("./routes/profiles");

// Use routes
app.use("/api/profiles", profileRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "profile-service" });
});

// Readiness check endpoint
app.get("/ready", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({
      status: "OK",
      service: "profile-service",
      database: "connected",
    });
  } else {
    res.status(503).json({
      status: "ERROR",
      service: "profile-service",
      database: "disconnected",
    });
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === "test"
        ? "mongodb://localhost:27017/profile-service-test"
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
  const PORT = process.env.PORT || 3004;
  app.listen(PORT, () => {
    console.log(`Profile service running on port ${PORT}`);
  });
}

module.exports = app;
