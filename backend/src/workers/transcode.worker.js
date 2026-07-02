import "dotenv/config";
import { Worker } from 'bullmq';
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import { redisConnection } from '../config/redis.js';
import { downloadFile, uploadFile } from '../services/storage.service.js';
import videoModel from '../models/video.model.js';
import '../config/database.js';

// HLS transcoding helper
function transcodeToHLS(inputPath, outputDir, height) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vf", `scale=-2:${height}`,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "28",
        "-c:a", "aac",
        "-hls_time", "10",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", path.join(outputDir, "segment%03d.ts"),
      ])
      .output(path.join(outputDir, "playlist.m3u8"))
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

// Folder ke andar saari files ka naam list karo (upload karne ke liye)
async function listFiles(dir) {
  const files = await fs.readdir(dir);
  return files.map(f => path.join(dir, f));
}

const worker = new Worker("transcode", async (job) => {
  const { videoId, rawKey } = job.data;

  const tmpBase = path.resolve("tmp", videoId);
  const inputPath = path.join(tmpBase, "raw.mp4");
  const dir480 = path.join(tmpBase, "480p");
  const dir720 = path.join(tmpBase, "720p");

  try {
    await videoModel.findByIdAndUpdate(videoId, { status: "transcoding" });

    // Folders banao
    await fs.mkdir(dir480, { recursive: true });
    await fs.mkdir(dir720, { recursive: true });

    // Step 1: Raw video download karo
    console.log(`[${videoId}] Downloading...`);
    await downloadFile(rawKey, inputPath);

    // Step 2: 480p HLS banao
    console.log(`[${videoId}] Transcoding 480p HLS...`);
    await transcodeToHLS(inputPath, dir480, 480);

    // Step 3: 720p HLS banao
    console.log(`[${videoId}] Transcoding 720p HLS...`);
    await transcodeToHLS(inputPath, dir720, 720);

    // Step 4: Master playlist banao
    const masterContent = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=842x480
480p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2560000,RESOLUTION=1280x720
720p/playlist.m3u8
`;
    const masterPath = path.join(tmpBase, "master.m3u8");
    await fs.writeFile(masterPath, masterContent);

    // Step 5: Saari files B2 upload karo
    console.log(`[${videoId}] Uploading HLS files to B2...`);

    const files480 = await listFiles(dir480);
    for (const filePath of files480) {
      const fileName = path.basename(filePath);
      const contentType = fileName.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/mp2t";
      await uploadFile(`processed/${videoId}/480p/${fileName}`, filePath, contentType);
    }

    const files720 = await listFiles(dir720);
    for (const filePath of files720) {
      const fileName = path.basename(filePath);
      const contentType = fileName.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/mp2t";
      await uploadFile(`processed/${videoId}/720p/${fileName}`, filePath, contentType);
    }

    await uploadFile(`processed/${videoId}/master.m3u8`, masterPath, "application/vnd.apple.mpegurl");

    // Step 6: DB update
    await videoModel.findByIdAndUpdate(videoId, {
      status: "ready",
      masterPlaylistKey: `processed/${videoId}/master.m3u8`,
    });

    // Cache invalidate karo — video ab ready hai, home pe dikhni chahiye
  await redisConnection.del("videos:all:page1:limit50");

    console.log(`[${videoId}] HLS transcoding complete`);

  } catch (err) {
    console.error(`[${videoId}] Error:`, err.message);
    await videoModel.findByIdAndUpdate(videoId, { status: "failed" });
    throw err;

  } finally {
    // Poora tmp/<videoId> folder delete karo (recursive)
    await fs.rm(tmpBase, { recursive: true, force: true });
    console.log(`[${videoId}] Cleanup done`);
  }

}, {
  connection: redisConnection,
  concurrency: 1,
  lockDuration: 600000,       // 10 minute (default 30 second hota hai)
  stalledInterval: 60000,     // har 1 minute check kare (default 30 sec)
  maxStalledCount: 1,         // kitni baar retry kare stalled hone par
});

async function uploadDirectory(localDir, b2KeyPrefix) {
  const files = await fs.readdir(localDir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      // recursively andar ke folder (480p, 720p) bhi upload karo
      await uploadDirectory(
        path.join(localDir, file.name),
        `${b2KeyPrefix}/${file.name}`
      );
    } else {
      const localFilePath = path.join(localDir, file.name);
      const b2Key = `${b2KeyPrefix}/${file.name}`;
      const contentType = file.name.endsWith(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : "video/mp2t"; // .ts segments ka content type

      await uploadFile(b2Key, localFilePath, contentType);
    }
  }
}

worker.on("completed", (job) => console.log(`Job ${job.id} complete`));
worker.on("failed", (job, err) => console.error(`Job ${job.id} failed:`, err.message));