const oracledb = require("oracledb");
require("dotenv").config();

let connection;

async function initOracleDb() {
  try {
    connection = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMax: 40,
      poolIncrement: 5,
      poolTimeout: 30,
      queueTimeout: 60000,
    });
    console.log("OracleDB connected successfully!");
  } catch (error) {
    console.error("Error connecting to OracleDB", error);
    process.exit(1);
  }
}

async function getConnection() {
  try {
    return await oracledb.getPool().getConnection();
  } catch (err) {
    console.error("Error getting a connection: ", err);
    throw err;
  }
}

module.exports = { initOracleDb, getConnection };
