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

// List all file names inside a folder (for upload)
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

    // Create folders
    await fs.mkdir(dir480, { recursive: true });
    await fs.mkdir(dir720, { recursive: true });

    // Step 1: Download raw video
    console.log(`[${videoId}] Downloading...`);
    await downloadFile(rawKey, inputPath);

    // Step 2: Create 480p HLS
    console.log(`[${videoId}] Transcoding 480p HLS...`);
    await transcodeToHLS(inputPath, dir480, 480);

    // Step 3: Create 720p HLS
    console.log(`[${videoId}] Transcoding 720p HLS...`);
    await transcodeToHLS(inputPath, dir720, 720);

    // Step 4: Create master playlist
    const masterContent = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1280000,RESOLUTION=842x480
480p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2560000,RESOLUTION=1280x720
720p/playlist.m3u8
`;
    const masterPath = path.join(tmpBase, "master.m3u8");
    await fs.writeFile(masterPath, masterContent);

    // Step 5: Upload all files to B2
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

    // Invalidate cache — video is now ready, should be visible on home
  await redisConnection.del("videos:all:page1:limit50");

    console.log(`[${videoId}] HLS transcoding complete`);

  } catch (err) {
    console.error(`[${videoId}] Error:`, err.message);
    await videoModel.findByIdAndUpdate(videoId, { status: "failed" });
    throw err;

  } finally {
    // Delete entire tmp/<videoId> folder (recursive)
    await fs.rm(tmpBase, { recursive: true, force: true });
    console.log(`[${videoId}] Cleanup done`);
  }

}, {
  connection: redisConnection,
  concurrency: 1,
  lockDuration: 600000,       // 10 minutes (default is 30 seconds)
  stalledInterval: 60000,     // check every 1 minute (default 30 sec)
  maxStalledCount: 1,         // how many times to retry if stalled
});

async function uploadDirectory(localDir, b2KeyPrefix) {
  const files = await fs.readdir(localDir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      // recursively upload subfolders (480p, 720p)
      await uploadDirectory(
        path.join(localDir, file.name),
        `${b2KeyPrefix}/${file.name}`
      );
    } else {
      const localFilePath = path.join(localDir, file.name);
      const b2Key = `${b2KeyPrefix}/${file.name}`;
      const contentType = file.name.endsWith(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : "video/mp2t"; // content type for .ts segments

      await uploadFile(b2Key, localFilePath, contentType);
    }
  }
}

worker.on("completed", (job) => console.log(`Job ${job.id} complete`));
worker.on("failed", (job, err) => console.error(`Job ${job.id} failed:`, err.message));