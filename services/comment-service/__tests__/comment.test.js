const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const axios = require("axios");

describe("Comment Service Tests", () => {
  let authToken;
  let testBlogId;
  let testCommentId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/comment-service-test"
    );

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

      // Create a test blog
      const blogResponse = await axios.post(
        "http://localhost:3002/api/blogs",
        {
          title: "Test Blog for Comments",
          content: "This is a test blog post for comments",
          tags: ["test", "comments"],
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      testBlogId = blogResponse.data._id;
    } catch (error) {
      console.error("Setup failed:", error.message);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /api/comments", () => {
    it("should create a new comment with valid token", async () => {
      const response = await request(app)
        .post("/api/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          blogId: testBlogId,
          content: "This is a test comment",
          author: "Test User",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.content).toBe("This is a test comment");

      testCommentId = response.body._id;
    });

    it("should reject comment creation without token", async () => {
      const response = await request(app).post("/api/comments").send({
        blogId: testBlogId,
        content: "This is a test comment",
        author: "Test User",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/comments", () => {
    it("should retrieve comments for a blog", async () => {
      const response = await request(app)
        .get(`/api/comments/blog/${testBlogId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});
