const express = require("express");
const { getConnection } = require("../db");
const verifyJWT = require("../middleware/verifyJWT"); // Your middleware to validate JWT
const router = express.Router();

router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (refreshToken) {
    await invalidateRefreshToken(refreshToken);
  }

  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.status(200).json({ message: "Saliste de la aplicacion!" });
});

// Function to invalidate the refresh token
const invalidateRefreshToken = async (refreshToken) => {
  let connection = await getConnection();
  const query = `DELETE FROM MCAM_REFRESH_TOKENS
                 WHERE refresh_token = :refreshToken`;
  await connection.execute(query, { refreshToken }, { autoCommit: true });
};

module.exports = router;
