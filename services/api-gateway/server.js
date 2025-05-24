const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require("dotenv");
const axios = require("axios");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "api-gateway" });
});

// Readiness check endpoint
app.get("/ready", async (req, res) => {
  try {
    const services = [
      { name: "auth-service", url: process.env.AUTH_SERVICE_URL },
      { name: "blog-service", url: process.env.BLOG_SERVICE_URL },
      { name: "comment-service", url: process.env.COMMENT_SERVICE_URL },
      { name: "profile-service", url: process.env.PROFILE_SERVICE_URL },
    ];

    const results = await Promise.allSettled(
      services.map((service) =>
        axios
          .get(`${service.url}/ready`)
          .then((response) => ({
            name: service.name,
            status: response.data.status,
          }))
          .catch(() => ({ name: service.name, status: "ERROR" }))
      )
    );

    const allServicesReady = results.every(
      (result) => result.status === "fulfilled" && result.value.status === "OK"
    );

    if (allServicesReady) {
      res.status(200).json({
        status: "OK",
        service: "api-gateway",
        dependencies: results.map((r) => r.value),
      });
    } else {
      res.status(503).json({
        status: "ERROR",
        service: "api-gateway",
        dependencies: results.map((r) => r.value),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      service: "api-gateway",
      error: "Failed to check service dependencies",
    });
  }
});

// Proxy middleware configuration
const authServiceProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api/auth": "/api/auth",
  },
});

const blogServiceProxy = createProxyMiddleware({
  target: process.env.BLOG_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api/blogs": "/api/blogs",
  },
});

const commentServiceProxy = createProxyMiddleware({
  target: process.env.COMMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api/comments": "/api/comments",
  },
});

const profileServiceProxy = createProxyMiddleware({
  target: process.env.PROFILE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api/profiles": "/api/profiles",
  },
});

// Routes
app.use("/api/auth", authServiceProxy);
app.use("/api/blogs", blogServiceProxy);
app.use("/api/comments", commentServiceProxy);
app.use("/api/profiles", profileServiceProxy);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
