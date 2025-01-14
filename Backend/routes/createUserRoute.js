const express = require("express");
const bcrypt = require("bcrypt");
const { getConnection } = require("../db");
const router = express.Router();

router.post("/createUser", async (req, res) => {
  const { username, email, password, userRole } = req.body;

  console.log(req.body);

  if (!username || !email || !password || !userRole) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let connection;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    connection = await getConnection();
    const query = `INSERT INTO MCAM_USUARIOS (USERNAME, PASSWORD_HASH, EMAIL, USER_ROLE)
       VALUES (:username, :passwordHash, :email, :userRole)`;

    const result = await connection.execute(
      query,
      {
        username,
        passwordHash: hashedPassword,
        email,
        userRole,
      },
      { autoCommit: true }
    );

    await connection.close();

    return res
      .status(201)
      .json({ message: "User created successfully", userId: result.lastRowid });
  } catch (error) {
    console.error("Error creating user:", error.message);
    if (error.errorNum === 1) {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
