require("dotenv").config();
const express = require("express");
const app = express();
const router = express.Router();
const { getConnection } = require("../db");

const ActiveDirectory = require("activedirectory");

const config = {
  url: process.env.LDAP_URL, // LDAP server URL
  baseDN: process.env.LDAP_BASE_DN, // Base DN for your LDAP domain
  username: process.env.LDAP_ADMIN_DN, // Admin DN to bind (using the one from your .env)
  password: process.env.LDAP_ADMIN_PASSWORD, // Admin password for binding
};

const ad = new ActiveDirectory(config);

const getUserData = async (username) => {
  let connection = await getConnection();
  const query = `SELECT * FROM ODS_DEV.USUARIOS_INTERNOS
                   WHERE UPPER(USERNAME) = UPPER(:username)`;

  const userDataResult = await connection.execute(query, {
    username,
  });

  const userData = userDataResult.rows.map(
    ([username, ldap_user, nombre, id_departamento, id_cargo]) => ({
      username,
      ldap_user,
      nombre,
      id_departamento,
      id_cargo,
    })
  );
  console.log("user data obtained: ", userData);
  return userData[0];
};

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const userData = await getUserData(username);

  const userDN = userData.ldap_user;

  // Authenticate user
  ad.authenticate(userDN, password, (err, auth) => {
    if (err) {
      console.error("Authentication error:", err);
      return res
        .status(500)
        .json({ error: "An error occurred during authentication" });
    }

    if (auth) {
      console.log(`User ${username} authenticated successfully.`);
      return res.status(200).json({ message: "Authentication successful" });
    } else {
      console.log(`Authentication failed for user ${username}.`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

module.exports = router;
