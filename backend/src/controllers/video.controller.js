import videoModel from "../models/video.model.js"
import { generatePlaybackUrl, getFileStream } from "../services/storage.service.js"
import AppError from "../utils/ApiError.js"
import { redisConnection } from "../config/redis.js";

export async function getStreamUrl(req, res, next) {
    try {
        const { id } = req.params;
        const video = await videoModel.findById(id);
        if (!video) return next(new AppError("Video not found", 404));
        if (video.status !== "ready") return next(new AppError("Video is not ready yet", 400));

        const masterUrl = `${req.protocol}://${req.get("host")}/api/video/${id}/hls/master.m3u8`;
        return res.status(200).json({ playbackUrl: masterUrl });
    } catch (err) {
        return next(new AppError("something went wrong in getStreamUrl: " + err))
    }
}

export async function streamHLSFile(req, res, next) {
    try {
        const { id } = req.params;
        const filePath = Array.isArray(req.params.splat)
            ? req.params.splat.join("/")
            : req.params.splat;
        console.log("filePath value:", filePath, "| type:", typeof filePath, "| isArray:", Array.isArray(filePath));

        const video = await videoModel.findById(id);
        if (!video) return next(new AppError("Video not found", 404));

        const b2Key = `processed/${id}/${filePath}`;
        console.log("Trying to fetch key:", b2Key);

        const response = await getFileStream(b2Key);

        // Set the Content-Type correctly, otherwise the browser will not understand the file
        const contentType = filePath.endsWith(".m3u8")
            ? "application/vnd.apple.mpegurl"
            : "video/mp2t";

        res.setHeader("Content-Type", contentType);
        response.Body.pipe(res); // Forward the stream directly, do not store in RAM

    } catch (err) {
        return next(new AppError("something went wrong in streamHLSFile: " + err, 500));
    }
}

export async function getVideoStatus(req, res, next) {
  try {
    const { id } = req.params;
    const video = await videoModel.findById(id).select("status title");
    if (!video) return next(new AppError("Video not found", 404));

    return res.status(200).json({ status: video.status, title: video.title });
  } catch (err) {
    return next(new AppError("something went wrong in getVideoStatus: " + err, 500));
  }
}

export async function getAllVideos(req, res, next) {
  try {
    const { type, genre, search, page = 1, limit = 50 } = req.query;

    // Use cache only when there is no filter (home page default request)
    const isDefaultRequest = !type && !genre && !search;
    const cacheKey = `videos:all:page${page}:limit${limit}`;

    if (isDefaultRequest) {
      const cached = await redisConnection.get(cacheKey);
      if (cached) {
        return res.status(200).json({ ...JSON.parse(cached), cached: true });
      }
    }

    const filter = { status: "ready" };
    if (type && type !== "all")   filter.type = type;
    if (genre && genre !== "All") filter.genres = genre;
    if (search) filter.title = { $regex: search, $options: "i" };

    const videos = await videoModel
      .find(filter)
      .select("title description type genres year rating thumbnail source videoId status createdAt")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const responseData = { data: videos, totalVideos: videos.length };

    // Only cache default request — 10 minutes
    if (isDefaultRequest) {
      await redisConnection.set(cacheKey, JSON.stringify(responseData), "EX", 600);
    }

    return res.status(200).json(responseData);
  } catch (err) {
    return next(new AppError("Failed to load videos: " + err.message, 500));
  }
}

export async function getVideoDetails(req, res, next) {
    try {
        const {id} = req.params

        const video = await videoModel.findById(id)
        if(!video) {
            return next(new AppError("no video Found", 404))
        }

        return res.status(200).json({
            message: "Video Deails fetch successfully",
            data: video
        })
    }catch(err) {
        return next(new AppError("something went wrong in fetching details of video " + err, 500))
    }
}

export async function editVideoDetails(req, res, next) {
    try {
        const { id } = req.params;

        const video = await videoModel.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!video) {
            return next(new AppError("Video not found", 404));
        }

        return res.status(200).json({
            message: "Video edited successfully",
            data: video
        });

    } catch (err) {
        return next(
            new AppError(
                "Something went wrong in editing video details " + err,
                500
            )
        );
    }
}

export async function deleteVideo(req, res, next) {
    try {
        const {id} = req.params

        const video = await videoModel.findByIdAndDelete(id)

        if(!video) {
            return next(new AppError("Video not found", 404));
        }

        return res.status(200).json({
            message: "video Deleted successfully"
        })
    }catch(err) {
        return next(new AppError("something went wrong in deleting video " + err, 500))
    }
}