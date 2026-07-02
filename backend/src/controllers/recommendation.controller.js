// recommendation.controller.js
import watchHistoryModel from "../models/watchHistory.model.js";
import videoModel from "../models/video.model.js";
import { getAIRecommendations } from "../services/recommendation.service.js";
import { redisConnection } from "../config/redis.js";
import AppError from "../utils/ApiError.js";

export async function getRecommendations(req, res, next) {
  try {
    const userId = req.user.userId;
    const cacheKey = `recommendations:${userId}`;

    // Check cache first
    const cached = await redisConnection.get(cacheKey);
    if (cached) {
      return res.status(200).json({ data: JSON.parse(cached), cached: true });
    }

    // Fetch user's watch history
    const history = await watchHistoryModel
      .find({ user: userId })
      .populate("video", "title type genres")
      .sort({ lastWatchedAt: -1 })
      .limit(15)
      .lean();

    if (history.length === 0) {
      return res.status(200).json({ data: [], message: "Please watch some videos first to get recommendations" });
    }

    // Fetch available videos (exclude already watched ones)
    const watchedIds = history.filter(h => h.video).map(h => h.video?._id?.toString());
    const allVideos = await videoModel
      .find({ status: "ready", _id: { $nin: watchedIds } })
      .select("title type genres year")
      .lean();

    if (allVideos.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Get recommendations from AI
    const recommendations = await getAIRecommendations(history, allVideos);

    // Fetch details for recommended video IDs
    const videoIds = recommendations.map(r => r.videoId);
    const videos = await videoModel.find({ _id: { $in: videoIds } }).lean();

    const enriched = recommendations.map(rec => ({
      ...videos.find(v => v._id.toString() === rec.videoId),
      reason: rec.reason,
    })).filter(v => v._id); // remove any that were not found

    // Cache in Redis for 30 minutes
    await redisConnection.set(cacheKey, JSON.stringify(enriched), "EX", 1800);

    return res.status(200).json({ data: enriched, cached: false });
  } catch (err) {
    console.error("Recommendation error:", err.message);
    return next(new AppError("Failed to generate recommendations: " + err.message, 500));
  }
}