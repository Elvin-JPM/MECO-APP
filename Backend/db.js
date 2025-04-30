const oracledb = require("oracledb");
require("dotenv").config();

// Configuration with safer defaults
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
  poolMax: 10,
  poolMin: 2,
  poolIncrement: 1,
  poolTimeout: 60,
  queueTimeout: 30000,
  poolPingInterval: 30,
  enableStatistics: true,
  stmtCacheSize: 30,
};

let pool;
let healthCheckInterval;

async function initOracleDb() {
  try {
    // Initialize the Oracle client
    try {
      await oracledb.initOracleClient();
    } catch (err) {
      console.log("Oracle client initialization warning:", err.message);
    }

    // Create connection pool
    pool = await oracledb.createPool(config);
    console.log("OracleDB pool created successfully!");

    // Add cleanup handlers
    process.once("SIGTERM", gracefulShutdown);
    process.once("SIGINT", gracefulShutdown);
    process.once("SIGHUP", gracefulShutdown);

    // Start health check interval
    startHealthChecks();

    return pool;
  } catch (error) {
    console.error("Error connecting to OracleDB:", error);
    if (error.errorNum === 28000) {
      console.error("Account is locked. Please contact your DBA.");
    }
    throw error;
  }
}

function startHealthChecks() {
  if (healthCheckInterval) clearInterval(healthCheckInterval);

  healthCheckInterval = setInterval(async () => {
    try {
      if (!(await checkPoolHealth())) {
        console.log("Pool health check failed - reinitializing");
        await initOracleDb();
      }
    } catch (err) {
      console.error("Health check error:", err);
    }
  }, 300000); // 5 minutes
}

async function getConnection() {
  if (!pool) await initOracleDb();

  let connection;
  try {
    connection = await pool.getConnection();

    // Set a timeout for connection use
    connection._startTime = Date.now();
    connection._timeout = setTimeout(() => {
      if (!connection._released) {
        console.warn("Connection held too long - forcing release");
        connection
          .close()
          .catch((err) => console.error("Forced release error:", err));
      }
    }, 300000); // 5 minute timeout

    // Override close method to clear timeout
    const originalClose = connection.close.bind(connection);
    connection.close = async function () {
      clearTimeout(this._timeout);
      this._released = true;
      return originalClose();
    };

    // Try to set Oracle timeout parameters (works in most modern Oracle versions)
    try {
      await connection.execute(
        `BEGIN
           -- Try to set a statement timeout (works in Oracle 12c+)
           EXECUTE IMMEDIATE 'ALTER SESSION SET MAX_IDLE_TIME = 30';
           EXECUTE IMMEDIATE 'ALTER SESSION SET MAX_IDLE_BLOCKER_TIME = 30';
         EXCEPTION
           WHEN OTHERS THEN
             NULL; -- Silently ignore if these parameters aren't available
         END;`
      );
    } catch (err) {
      console.log("Could not set all session timeout parameters:", err.message);
    }

    return connection;
  } catch (err) {
    console.error("Error getting connection:", err);

    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing failed connection:", closeErr);
      }
    }

    if (err.errorNum === 28000) {
      console.error("Account locked - contact DBA");
    } else if (err.message.includes("NJS-040")) {
      console.error("Pool not initialized - retrying...");
      await initOracleDb();
      return getConnection();
    }

    throw err;
  }
}

async function gracefulShutdown() {
  console.log("Graceful shutdown initiated");
  await cleanup();
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  process.exit(0);
}

async function cleanup() {
  try {
    if (pool) {
      console.log("Closing connection pool");
      await pool.close(10);
      pool = null;
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

async function checkPoolHealth() {
  if (!pool) return false;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.execute("SELECT 1 FROM DUAL");
    return true;
  } catch (err) {
    console.error("Health check failed:", err);
    return false;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing health check connection:", err);
      }
    }
  }
}

module.exports = {
  initOracleDb,
  getConnection,
  cleanup,
  gracefulShutdown,
  checkPoolHealth,
  getPool: () => pool,
};
