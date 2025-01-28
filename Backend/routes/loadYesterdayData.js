const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");

// Path to the Python script (handle spaces in folder names by enclosing the path in quotes)
const pythonScriptPath = path.join(__dirname, "../Data Loading/main.py");

console.log(pythonScriptPath);

// Example parameters to send to the Python script
const param1 = "value1";
const param2 = "value2";

// Schedule a cron job to run every day at 1:00 AM
cron.schedule("31 14 * * *", () => {
  console.log("Running the Python script at 1:00 AM");

  // Pass parameters to the Python script, handle spaces in the path by quoting it
  exec(`python "${pythonScriptPath}"`, (error, stdout, stderr) => {
    console.log(pythonScriptPath);
    if (error) {
      console.error(`Error executing script: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Output: ${stdout}`);
  });
});
