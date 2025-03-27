const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
require("dotenv").config();

// Determine Python executable
const pythonExecutable =
  process.env.IS_DOCKER === "true"
    ? "python3"
    : "C:\\Users\\eposadas\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";

// Determine Python script path
const pythonScriptPath =
  process.env.IS_DOCKER === "true"
    ? "/app/Data_Loading/main.py"
    : path.join(__dirname, "../Data_Loading/main.py");

console.log(`Python Executable: ${pythonExecutable}`);
console.log(`Python Script Path: ${pythonScriptPath}`);

// Function to execute Python script
function runPythonScript(days) {
  console.log(`Running the Python script for ${days} days back`);
  exec(
    `"${pythonExecutable}" "${pythonScriptPath}" ${days}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log("Python script finished executing!");
      console.log(`Output: ${stdout}`);
    }
  );
}

// Schedule jobs
cron.schedule("2,17,32,47 * * * *", () => runPythonScript(1)); // Runs every 15 min
cron.schedule("10 1 * * *", () => runPythonScript(7)); // Runs at 1:10 AM daily

console.log("Python worker started. Waiting for scheduled tasks...");
