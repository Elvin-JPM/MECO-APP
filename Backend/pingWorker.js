const cron = require("node-cron");
const { pingDevice } = require("./utils/pingUtils");
const { getConnection } = require("./db");
const { getIO } = require("./lib/configureSocket");

// Track if pinging is currently in progress
let isPingingInProgress = false;

// Function to fetch IPs from database
async function fetchIPsToPing() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      "SELECT IP FROM MCAM_MEDIDORES WHERE INTEGRADO = 1",
      [],
      { outFormat: require("oracledb").OUT_FORMAT_OBJECT }
    );
    return result.rows.map((row) => row.IP);
  } catch (error) {
    console.error("Error fetching IPs from database:", error);
    return [];
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
}

// Function to ping all devices
async function pingAllDevices() {
  // Skip if previous ping operation is still running
  if (isPingingInProgress) {
    console.log("Ping operation skipped: Previous operation still in progress");
    return;
  }

  isPingingInProgress = true;
  console.log("Starting ping operation for all devices");

  try {
    const ipAddresses = await fetchIPsToPing();
    if (ipAddresses.length === 0) {
      console.warn("No IP addresses found to ping");
      return;
    }

    console.log(`Pinging ${ipAddresses.length} devices`);

    // Ping all devices in parallel for efficiency
    await Promise.all(
      ipAddresses.map(async (ip) => {
        try {
          const result = await pingDevice(ip);
          console.log(
            `Ping result for ${ip}: ${
              result.success ? "Success" : "Failed"
            } - ${result.message}`
          );
        } catch (error) {
          console.error(`Error pinging ${ip}:`, error);
        }
      })
    );
  } catch (error) {
    console.error("Error in pingAllDevices:", error);
  } finally {
    isPingingInProgress = false;
    console.log("Ping operation completed");
  }

  try {
    const io = getIO();
    io.emit("meterStatusUpdated"); // Notify all connected clients
    console.log("Notified clients of status update");
  } catch (error) {
    console.error("Error notifying clients:", error);
  }
}

// Initialize the worker
function startPingWorker() {
  // Run immediately on startup
  pingAllDevices();

  // Then run every minute
  cron.schedule("* * * * *", pingAllDevices);

  console.log("Ping worker started. Will ping devices every minute.");
}

module.exports = {
  startPingWorker,
  pingAllDevices, // Exported for testing purposes
};
