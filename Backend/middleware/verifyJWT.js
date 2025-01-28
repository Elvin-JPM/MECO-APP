require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  console.log("Cookies received at verifyJWT:", req.cookies); // Log the cookies
  console.log("Authorization header:", req.headers.authorization);
  const token = req.cookies.auth_token; // Read token from cookie
  if (!token) {
    console.log("No auth_token found in cookies");
    return res.status(401).json({ error: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Error verifying token:", err);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    console.log("Decoded token:", decoded);
    req.user = decoded; // Attach user data to the request
    next();
  });
};

module.exports = verifyJWT;
