const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
require("dotenv").config();

// Track if a script is currently running
let isScriptRunning = false;

// Determine Python executable based on environment
const pythonExecutable =
  process.env.IS_DOCKER === "true"
    ? "python3" // Docker environment
    : process.platform === "win32"
    ? "C:\\Users\\eposadas\\AppData\\Local\\Programs\\Python\\Python313\\python.exe" // Windows
    : "python3"; // Linux/Mac

// Determine Python script path
const pythonScriptPath =
  process.env.IS_DOCKER === "true"
    ? "/app/Data_Loading/main.py"
    : path.join(__dirname, "../Data_Loading/main.py");

console.log(`Python Executable: ${pythonExecutable}`);
console.log(`Python Script Path: ${pythonScriptPath}`);

// Function to execute Python script
function runPythonScript(days) {
  // Check if a script is already running
  if (isScriptRunning) {
    console.log(`Script execution skipped: Another script is already running`);
    return;
  }

  console.log(`Running the Python script for ${days} days back`);
  isScriptRunning = true;

  const pythonProcess = exec(
    `"${pythonExecutable}" "${pythonScriptPath}" ${days}`,
    (error, stdout, stderr) => {
      // Reset the running flag when the script finishes
      isScriptRunning = false;

      if (error) {
        console.error(`Error executing script: ${error}`);
        return;
      }
      console.log("Python script finished executing!");
      if (stdout) console.log(`Output:\n${stdout}`);
      if (stderr) console.error(`Errors:\n${stderr}`);
    }
  );

  // Handle real-time output
  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python Output: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python Error: ${data}`);
  });

  // Handle process termination
  pythonProcess.on("exit", (code) => {
    isScriptRunning = false;
    console.log(`Python process exited with code ${code}`);
  });

  // Handle process errors
  pythonProcess.on("error", (err) => {
    isScriptRunning = false;
    console.error(`Failed to start Python process: ${err}`);
  });
}

// Schedule jobs
if (process.env.NODE_ENV === "production") {
  cron.schedule("2,17,32,47 * * * *", () => runPythonScript(1)); // Runs every 15 min
  cron.schedule("10 1 * * *", () => runPythonScript(7)); // Runs at 1:10 AM daily
} else {
  cron.schedule("43 * * * *", () => runPythonScript(1)); // Runs every 15 for testing
  cron.schedule("40 1 * * *", () => runPythonScript(7)); // Runs once a day for testing
}
console.log("Python worker started. Waiting for scheduled tasks...");
