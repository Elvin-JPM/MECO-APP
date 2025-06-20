const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const net = require("net");
const { getConnection } = require("../db");
const { autoCommit } = require("oracledb");

const pingDevice = async (ipAddress) => {
  let connection;
  if (!net.isIP(ipAddress)) {
    return {
      success: false,
      message: "Invalid IP address format",
    };
  }

  const query = `UPDATE MCAM_MEDIDORES 
                   SET ESTADO_COM = :estadoCom, ULTIMO_INTENTO = :ultimo_intento, ULTIMO_INTENTO_INCORRECTO = :ultimo_intento_incorrecto
                   WHERE IP = :ip                 
    `;
  const registroIncorrectoQuery = `UPDATE MCAM_MEDIDORES 
    SET ESTADO_COM = :estadoCom, ULTIMO_INTENTO = :ultimo_intento
    WHERE IP = :ip                 
`;

  const ultimoRegistroIncorrectoQuery = `SELECT ULTIMO_INTENTO_INCORRECTO FROM MCAM_MEDIDORES WHERE IP = :ip`;

  try {
    // Use platform-specific ping command
    connection = await getConnection();
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

    console.log("Resultado de isSucces: ", isSuccess);

    if (isSuccess) {
      try {
        await connection.execute(
          query,
          {
            estadoCom: 1,
            ultimo_intento: new Date(),
            ultimo_intento_incorrecto: null,
            ip: ipAddress,
          },
          { autoCommit: true }
        );
      } catch (dbError) {
        console.error(`Database update failed for ${ipAddress}:`, dbError);
        // Still return success=true for ping, but log DB failure
      }
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
    const resultUltimoRegistroIncorrecto = await connection.execute(
      ultimoRegistroIncorrectoQuery,
      { ip: ipAddress }
    );

    const ultimoRegistroIncorrecto = resultUltimoRegistroIncorrecto.rows[0][0];
    console.log("Ultimo registro incorrecto: ", ultimoRegistroIncorrecto);

    if (!ultimoRegistroIncorrecto) {
      await connection.execute(
        query,
        {
          estadoCom: 0,
          ultimo_intento: new Date(),
          ultimo_intento_incorrecto: new Date(),
          ip: ipAddress,
        },
        { autoCommit: true }
      );
    } else {
      await connection.execute(
        registroIncorrectoQuery,
        { estadoCom: 0, ultimo_intento: new Date(), ip: ipAddress },
        { autoCommit: true }
      );
    }

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
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection: ", closeError);
      }
    }
  }
};

module.exports = { pingDevice };
