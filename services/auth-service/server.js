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
const authRoutes = require("./routes/auth");

// Use routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "auth-service" });
});

// Readiness check endpoint
app.get("/ready", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res
      .status(200)
      .json({ status: "OK", service: "auth-service", database: "connected" });
  } else {
    res.status(503).json({
      status: "ERROR",
      service: "auth-service",
      database: "disconnected",
    });
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
