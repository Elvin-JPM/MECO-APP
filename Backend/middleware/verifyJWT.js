require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  const accessToken = req.cookies.auth_token;

  if (!accessToken) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // Verify the access token
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    req.user = decoded; // Attach user data to the request
    next(); // Proceed to the next middleware/route
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Access token is expired
      return res.status(401).json({ error: "Access token expired" });
    } else {
      // Other JWT verification errors (e.g., invalid token)
      return res.status(403).json({ error: "Invalid token" });
    }
  }
};

module.exports = verifyJWT;
