import "dotenv/config";
import connectDB from "./src/config/database.js";
import "./src/workers/transcode.worker.js";  // worker start karna

async function start() {
  await connectDB();  // pehle DB connect ho jaaye
  console.log("Transcode worker chal raha hai...");
}

start();