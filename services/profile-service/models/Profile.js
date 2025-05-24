const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  location: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  social: {
    twitter: String,
    facebook: String,
    linkedin: String,
    github: String,
  },
  interests: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
profileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Profile", profileSchema);
