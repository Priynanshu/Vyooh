import "dotenv/config";
import connectDB from "./src/config/database.js";
import "./src/workers/transcode.worker.js";  // Start worker

async function start() {
  await connectDB();  // Ensure DB connects first
  console.log("Transcode worker is running...");
}

start();