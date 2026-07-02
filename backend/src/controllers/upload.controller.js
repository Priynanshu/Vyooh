import { generateUploadUrl, uploadFile } from "../services/storage.service.js";
import AppError from "../utils/ApiError.js"
import videoModel from '../models/video.model.js'
import { transcodeQueue } from "../queues/transcode.queue.js";
import {scrapeYouTube} from "../services/scraper.service.js"

export async function getUploadUrl(req, res, next) {
  try {
    const { filename = "default-filename", contentType = "video/mp4", title, type, genres, year, rating, thumbnail, description } = req.body;

  if(!contentType || !title || !description || !thumbnail) {
    return next(new AppError("All Fields are required", 400))
  }

  const key = `raw/${Date.now()}-${filename}`;
  const uploadUrl = await generateUploadUrl(key, contentType);

  const video = await videoModel.create({
    title,
    type,
    genres,
    year,
    rating,
    thumbnail,
    description,
    rawKey: key,
    status: "pending"
  })
  return res.status(201).json({ 
        uploadUrl, 
        videoId: video._id, 
        key 
    });
  }catch(error) {
    return next(new AppError("something went wrong in getUploadUrl: " + error, 500))
  }
}

export async function uploadYTVideo(req, res, next) {
    try {
         const { filename, title, type, genres, year, rating, description, url } = req.body;
        
         const existing = await videoModel.findOne({url})
         if(existing) {
          return next(new AppError("You already uploaded this video", 400))
         }

         const scrapedData = await scrapeYouTube(url)

         const video = await videoModel.create({
          url,
          videoId: scrapedData.videoId,
          filename,
          title,
          type,
          genres,
          rating,
          year,
          thumbnail: scrapedData.thumbnail,
          description,
          source: "youtube",
          status: "ready"
         })

         await redisConnection.del("videos:all:page1:limit50");

         return res.status(201).json({
          message: "video upload successfully",
          data: video
         })

    }catch(err) {
        return next(new AppError("something went wrong in Upload video by youtube " + err, 500))
    }
}


export async function markUploadComplete(req, res, next) {
  try {
    const { videoId } = req.body;

    const video = await videoModel.findById(videoId);
    if (!video) return next(new AppError("Video not found", 404))

    video.status = "queued";
    await video.save();

    await transcodeQueue.add("transcode", {
      videoId: video._id.toString(),
      rawKey: video.rawKey,
    });

    // Cache clear karo taaki next request fresh data le
    await redisConnection.del("videos:all:page1:limit50");

    return res.status(200).json({ message: "Upload is complete, transcoding Goes into queue" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function directUpload(req, res, next) {
  try {
    const { title, description, thumbnail, type, genres, year, rating } = req.body;
    const file = req.file;

    if (!file) return next(new AppError("Video file nahi mili", 400));
    if (!title || !description || !thumbnail) {
      return next(new AppError("Title, description aur thumbnail zaroori hain", 400));
    }

    const key = `raw/${Date.now()}-${file.originalname.replace(/\s/g, "-")}`;

    // Server se seedha B2 mein upload — CORS nahi hoga
    await uploadFile(key, file.buffer, file.mimetype || "video/mp4");

    // DB mein entry banao
    const video = await videoModel.create({
      title,
      description,
      thumbnail,
      type: type || "movie",
      genres: JSON.parse(genres || "[]"),
      year: Number(year) || new Date().getFullYear(),
      rating: rating || "U/A",
      rawKey: key,
      status: "pending",
    });

    // Transcoding queue mein daalo
    await transcodeQueue.add("transcode", {
      videoId: video._id.toString(),
      rawKey: key,
    });

    video.status = "queued";
    await video.save();

    // Cache clear karo taaki next request fresh data le
    await redisConnection.del("videos:all:page1:limit50");

    return res.status(201).json({
      message: "Upload successful, transcoding shuru ho gayi",
      videoId: video._id,
    });
  } catch (err) {
    return next(new AppError("Direct upload fail hua: " + err.message, 500));
  }
}