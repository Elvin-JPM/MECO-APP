const ping = require("ping");
const net = require("net");

const pingDevice = async (ipAddress) => {
  if (!net.isIP(ipAddress)) {
    return {
      success: false,
      message: "Invalid IP address format",
    };
  }

  try {
    const response = await ping.promise.probe(ipAddress, {
      timeout: 5,
      min_reply: 1,
      extra: ["-i", "2"],
    });

    return {
      success: response.alive,
      message: response.alive
        ? `Ping to ${ipAddress} successful (${response.time}ms)`
        : `Ping to ${ipAddress} failed`,
      time: response.time,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error pinging ${ipAddress}: ${error.message}`,
    };
  }
};

module.exports = { pingDevice };
