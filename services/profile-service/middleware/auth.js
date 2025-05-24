const jwt = require("jsonwebtoken");
const axios = require("axios");

const validateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token with auth service
    const response = await axios.post(
      "http://localhost:3001/api/auth/verify",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // If we get a user object back, the token is valid
    if (response.data.user) {
      req.user = {
        id: response.data.user._id,
        username: response.data.user.username,
      };
      next();
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Token validation error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { validateToken };
