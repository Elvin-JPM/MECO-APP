require("dotenv").config();
const express = require("express");
const app = express();
const router = express.Router();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../db");
const { v4: uuidv4 } = require("uuid");
const ActiveDirectory = require("activedirectory");

const generateRefreshToken = () => {
  return uuidv4();
};

// Configuracion para Active Directory
const config = {
  url: process.env.LDAP_URL, // LDAP server URL
  baseDN: process.env.LDAP_BASE_DN, // Base DN for your LDAP domain
  username: process.env.LDAP_ADMIN_DN, // Admin DN to bind (using the one from your .env)
  password: process.env.LDAP_ADMIN_PASSWORD, // Admin password for binding
};

const ad = new ActiveDirectory(config);

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

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
    })
  );
  console.debug("user data obtained: ", userData);
  return userData[0];
};

//////////////////////////// LOGIN ROUTE ///////////////////////////////////////

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.debug("Data received at login in the backend: ", req.body);

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Nombre de usuario y contraseña requeridos" });
  }

  const userData = await getUserData(username);
  if (!userData) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  if (![18, 4, 12, 13].includes(userData.id_departamento)) {
    return res.status(401).json({ error: "Usuario no autorizado" });
  }

  const userDN = userData.ldap_user;

  // Authenticate user
  ad.authenticate(userDN, password, (err, auth) => {
    if (err) {
      console.error("Error de autenticación: ", err);
      return res.status(500).json({ error: err });
    }

    if (auth) {
      console.log(`Usuario ${username} autenticado correctamente.`);

      // Generate JWT
      const token = jwt.sign(
        {
          username: userData.username,
          nombre: userData.nombre,
          id_departamento: userData.id_departamento,
        },
        JWT_SECRET,
        { expiresIn: "5m" } // Token validity
      );

      // Generate refresh token
      const refreshToken = generateRefreshToken();
      storeRefreshToken(userData.username, refreshToken);

      res.cookie("auth_token", token, {
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 300000, //El token expira en 5 minutos
      });

      // Set the refresh token in a separate cookie
      res.cookie("refresh_token", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 604800000, // El refresh token durara 7 dias (milisegundos), luego de eso el usuario sera forzado a hacer log in
      });

      return res.status(200).json({
        message: "Autenticación exitosa",
        //token,
      });
    } else {
      console.log(`Autenticación fallida para el usuario ${username}.`);
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }
  });
});

// Function to store refresh token in the database
const storeRefreshToken = async (username, refreshToken) => {
  let connection = await getConnection();
  const query = `INSERT INTO MCAM_REFRESH_TOKENS (username, refresh_token)
                 VALUES (:username, :refreshToken)`;
  await connection.execute(
    query,
    { username, refreshToken },
    { autoCommit: true }
  );
};

module.exports = router;
