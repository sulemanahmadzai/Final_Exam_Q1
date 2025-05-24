const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");
const axios = require("axios");

// Get comments by blog ID
router.get("/blog/:blogId", async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .sort({ createdAt: -1 })
      .select("-__v");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create comment
router.post(
  "/",
  [
    auth,
    body("content").trim().isLength({ min: 1, max: 1000 }).escape(),
    body("blogId").isMongoId(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, blogId } = req.body;

      // Verify blog exists
      try {
        await axios.get(`${process.env.BLOG_SERVICE_URL}/api/blogs/${blogId}`);
      } catch (error) {
        return res.status(404).json({ message: "Blog not found" });
      }

      const comment = new Comment({
        content,
        blog: blogId,
        author: req.user.id,
        authorName: req.user.username,
      });

      await comment.save();
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update comment
router.put(
  "/:id",
  [auth, body("content").trim().isLength({ min: 1, max: 1000 }).escape()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if user is the author
      if (comment.author.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this comment" });
      }

      comment.content = req.body.content;
      await comment.save();
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete comment
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await comment.remove();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
