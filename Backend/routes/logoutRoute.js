const express = require("express");
const verifyJWT = require("../middleware/verifyJWT"); // Your middleware to validate JWT
const router = express.Router();

router.post("/logout", (req, res) =>
{
  console.log("Cerrando sesión...")
  // Clear the cookie containing the JWT token
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.status(200).json({ message: "Saliste correctamente!" });
});

module.exports = router;
