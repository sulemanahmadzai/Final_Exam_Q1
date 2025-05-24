const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Profile = require("../models/Profile");
const { validateToken } = require("../middleware/auth");

// Get current user's profile
router.get("/me", validateToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create or update profile
router.post(
  "/",
  [
    validateToken,
    body("bio").optional().trim().isLength({ max: 500 }).escape(),
    body("location").optional().trim().escape(),
    body("website").optional().trim().isURL().escape(),
    body("social.twitter").optional().trim().isURL().escape(),
    body("social.facebook").optional().trim().isURL().escape(),
    body("social.linkedin").optional().trim().isURL().escape(),
    body("social.github").optional().trim().isURL().escape(),
    body("interests").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bio, location, website, social, interests } = req.body;

      // Build profile object
      const profileFields = {
        user: req.user.id,
        bio,
        location,
        website,
        social,
        interests,
      };

      // Update or create profile
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
      } else {
        // Create
        profile = new Profile(profileFields);
        await profile.save();
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get profile by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete profile
router.delete("/", validateToken, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    res.json({ message: "Profile deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
