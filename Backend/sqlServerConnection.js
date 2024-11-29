const sql = require("mssql");
require("dotenv").config();

let pool;

async function initSqlServer() {
  try {
    pool = await sql.connect({
      user: process.env.SQL_USER, // SQL Server username
      password: process.env.SQL_PASSWORD, // SQL Server password
      server: process.env.SQL_SERVER, // SQL Server address
      database: process.env.SQL_DATABASE, // Database name
      options: {
        encrypt: true, // Use encryption for data in transit (required for Azure)
        trustServerCertificate: true, // For self-signed certificates (set to false in production)
      },
    });
    console.log("SQL Server connected successfully!");
  } catch (error) {
    console.error("Error connecting to SQL Server:", error);
    process.exit(1);
  }
}

async function getSqlServerConnection() {
  if (!pool) {
    throw new Error(
      "SQL Server connection pool not initialized. Call initSqlServer first."
    );
  }
  return pool;
}

module.exports = { initSqlServer, getSqlServerConnection };
