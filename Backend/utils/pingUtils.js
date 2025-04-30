const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const net = require("net");

const pingDevice = async (ipAddress) => {
  if (!net.isIP(ipAddress)) {
    return {
      success: false,
      message: "Invalid IP address format",
    };
  }

  try {
    // Use platform-specific ping command
    const isWindows = process.platform === "win32";
    const pingCommand = isWindows
      ? `ping -n 1 -w 2000 ${ipAddress}`
      : `ping -c 1 -W 2 ${ipAddress}`;

    // console.log(`Executing ping command: ${pingCommand}`);
    const { stdout, stderr } = await execAsync(pingCommand);
    // console.log(`Ping output for ${ipAddress}:`, stdout);

    // Check if the ping was successful
    const isSuccess = isWindows
      ? stdout.includes("TTL=") || stdout.includes("Reply from")
      : stdout.includes("1 received") || stdout.includes("bytes from");

    // Extract ping time
    let time = null;
    if (isWindows) {
      const timeMatch = stdout.match(/time[=<](\d+)ms/i);
      time = timeMatch ? parseInt(timeMatch[1]) : null;
    } else {
      const timeMatch = stdout.match(/time=(\d+\.?\d*) ms/);
      time = timeMatch ? parseFloat(timeMatch[1]) : null;
    }

    return {
      success: isSuccess,
      message: isSuccess
        ? `Ping to ${ipAddress} successful${time ? ` (${time}ms)` : ""}`
        : `Ping to ${ipAddress} failed`,
      time: time,
    };
  } catch (error) {
    // console.error(`Ping error for ${ipAddress}:`, error);

    // Check if the error is due to the host being down
    if (
      error.stderr &&
      (error.stderr.includes("100% packet loss") ||
        error.stderr.includes("Request timed out"))
    ) {
      return {
        success: false,
        message: `Ping to ${ipAddress} failed: Host is down`,
        time: null,
      };
    }

    // Check if the error is due to network unreachable
    if (error.stderr && error.stderr.includes("Network is unreachable")) {
      return {
        success: false,
        message: `Ping to ${ipAddress} failed: Network is unreachable`,
        time: null,
      };
    }

    return {
      success: false,
      message: `Error pinging ${ipAddress}: ${error.message}`,
      time: null,
    };
  }
};

module.exports = { pingDevice };
