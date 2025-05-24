const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const axios = require("axios");

describe("Profile Service Tests", () => {
  let authToken;
  let testUserId;
  let otherUserToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/profile-service-test"
    );

    // Clear all collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }

    // Create test users
    try {
      // Create first test user
      try {
        await axios.post("http://localhost:3001/api/auth/register", {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        });
      } catch (err) {
        if (
          !(
            err.response &&
            err.response.status === 400 &&
            err.response.data.message === "User already exists"
          )
        ) {
          throw err;
        }
      }

      // Create second test user
      try {
        await axios.post("http://localhost:3001/api/auth/register", {
          username: "otheruser",
          email: "other@example.com",
          password: "password123",
        });
      } catch (err) {
        if (
          !(
            err.response &&
            err.response.status === 400 &&
            err.response.data.message === "User already exists"
          )
        ) {
          throw err;
        }
      }

      // Get auth token for test user
      const loginResponse = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email: "test@example.com",
          password: "password123",
        }
      );
      authToken = loginResponse.data.token;
      testUserId = loginResponse.data.user.id;

      // Get token for another user
      const otherUserResponse = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email: "other@example.com",
          password: "password123",
        }
      );
      otherUserToken = otherUserResponse.data.token;

      // Create a profile for the test user
      await axios.post(
        "http://localhost:3004/api/profiles",
        {
          bio: "Initial test bio",
          location: "Test City",
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    } catch (error) {
      console.error("Setup failed:", error.message);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /api/profiles/me", () => {
    it("should fetch current user profile", async () => {
      const response = await request(app)
        .get("/api/profiles/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user", testUserId);
    });

    it("should reject profile fetch without token", async () => {
      const response = await request(app).get("/api/profiles/me");

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/profiles/:id", () => {
    it("should update own profile", async () => {
      const response = await request(app)
        .put(`/api/profiles/${testUserId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          bio: "Updated test bio",
          location: "Test Location",
        });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe("Updated test bio");
    });

    it("should reject updating another user profile", async () => {
      const response = await request(app)
        .put(`/api/profiles/${testUserId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send({
          bio: "Malicious update attempt",
          location: "Test Location",
        });

      expect(response.status).toBe(403);
    });
  });
});
