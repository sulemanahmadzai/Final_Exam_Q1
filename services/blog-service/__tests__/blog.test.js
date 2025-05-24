const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const axios = require("axios");
const { setupTestDatabase, teardownTestDatabase } = require("../test/setup");

describe("Blog Service Tests", () => {
  let authToken;
  let testBlogId;

  beforeAll(async () => {
    // Setup test database and create test user
    await setupTestDatabase();

    // Get auth token
    try {
      const loginResponse = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email: "test@example.com",
          password: "password123",
        }
      );
      authToken = loginResponse.data.token;
    } catch (error) {
      console.error("Failed to get auth token:", error.message);
    }
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("POST /api/blogs", () => {
    it("should create a new blog post with valid token", async () => {
      const response = await request(app)
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Blog",
          content: "This is a test blog post",
          tags: ["test", "ci"],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.title).toBe("Test Blog");

      testBlogId = response.body._id;
    });

    it("should reject blog creation without token", async () => {
      const response = await request(app)
        .post("/api/blogs")
        .send({
          title: "Test Blog",
          content: "This is a test blog post",
          tags: ["test", "ci"],
        });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/blogs", () => {
    it("should retrieve all blogs", async () => {
      // First create a blog post
      await request(app)
        .post("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Blog for GET",
          content: "This is a test blog post for GET",
          tags: ["test", "get"],
        });

      const response = await request(app)
        .get("/api/blogs")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});
