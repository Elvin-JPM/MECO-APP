require("dotenv").config();
const express = require("express");
const app = express();
const router = express.Router();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../db");
const { v4: uuidv4 } = require("uuid");
const ActiveDirectory = require("activedirectory");

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  console.log("Refresh token from cookies:", req.cookies.refresh_token);

  // Verify the refresh token (check if it exists in the database)
  const isValidRefreshToken = await verifyRefreshToken(refreshToken);
  if (!isValidRefreshToken) {
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }

  // Fetch user data based on the refresh token
  const userData = await getUserDataByRefreshToken(refreshToken);
  if (!userData) {
    return res.status(404).json({ error: "User not found" });
  }

  // Generate a new access token
  const newAccessToken = jwt.sign(
    {
      username: userData?.username || "eposadas",
      nombre: userData?.nombre,
      id_departamento: userData?.id_departamento,
    },
    JWT_SECRET,
    { expiresIn: "5m" } // Short-lived access token
  );

  console.log(
    "Data received for the refresh token was:",
    userData?.username,
    userData?.nombre,
    userData?.id_departamento
  );
  // Set the new access token in a cookie
  res.cookie("auth_token", newAccessToken, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 300000, // 5 minutes
  });

  return res.status(200).json({ message: "Access token refreshed" });
});

// Function to verify the refresh token
const verifyRefreshToken = async (refreshToken) => {
  let connection = await getConnection();
  const query = `SELECT * FROM MCAM_REFRESH_TOKENS
                 WHERE refresh_token = :refreshToken`;
  const result = await connection.execute(query, { refreshToken });
  return result.rows.length > 0;
};

// Function to get user data by refresh token
const getUserDataByRefreshToken = async (refreshToken) => {
  let connection = await getConnection();
  const query = `SELECT u.* FROM MCAM_REFRESH_TOKENS rt
                 JOIN ODS_DEV.USUARIOS_INTERNOS u ON rt.username = u.username
                 WHERE rt.refresh_token = :refreshToken`;
  const result = await connection.execute(query, { refreshToken });
  const userData = result.rows.map(
    ([username, ldap_user, nombre, id_departamento, id_cargo]) => ({
      username,
      ldap_user,
      nombre,
      id_departamento,
    })
  );
  console.log("query result", userData);
  return userData[0];
};

module.exports = router;
