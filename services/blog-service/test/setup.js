const mongoose = require("mongoose");
const axios = require("axios");

const createTestUser = async () => {
  try {
    await axios.post("http://localhost:3001/api/auth/register", {
      email: "test@example.com",
      password: "password123",
      username: "testuser",
    });
  } catch (error) {
    // If user already exists, that's fine
    if (error.response?.status !== 409) {
      console.error("Error creating test user:", error.message);
    }
  }
};

const setupTestDatabase = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/blog-service-test");
    await mongoose.connection.dropDatabase();
    await createTestUser();
  } catch (error) {
    console.error("Error setting up test database:", error);
    throw error;
  }
};

const teardownTestDatabase = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error closing database connection:", error);
    throw error;
  }
};

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
};
