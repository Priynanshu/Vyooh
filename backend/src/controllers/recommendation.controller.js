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

    // Pehle cache check karo
    const cached = await redisConnection.get(cacheKey);
    if (cached) {
      return res.status(200).json({ data: JSON.parse(cached), cached: true });
    }

    // User ki history fetch karo
    const history = await watchHistoryModel
      .find({ user: userId })
      .populate("video", "title type genres")
      .sort({ lastWatchedAt: -1 })
      .limit(15)
      .lean();

    if (history.length === 0) {
      return res.status(200).json({ data: [], message: "Watch kuch videos pehle, recommendations ke liye" });
    }

    // Available videos fetch karo (jo already dekhi hain unhe exclude karo)
    const watchedIds = history.filter(h => h.video).map(h => h.video?._id?.toString());
    const allVideos = await videoModel
      .find({ status: "ready", _id: { $nin: watchedIds } })
      .select("title type genres year")
      .lean();

    if (allVideos.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // AI se recommendations lo
    const recommendations = await getAIRecommendations(history, allVideos);

    // Recommended video IDs se poori details fetch karo
    const videoIds = recommendations.map(r => r.videoId);
    const videos = await videoModel.find({ _id: { $in: videoIds } }).lean();

    const enriched = recommendations.map(rec => ({
      ...videos.find(v => v._id.toString() === rec.videoId),
      reason: rec.reason,
    })).filter(v => v._id); // jo nahi mile unhe hata do

    // Redis mein 30 min cache karo
    await redisConnection.set(cacheKey, JSON.stringify(enriched), "EX", 1800);

    return res.status(200).json({ data: enriched, cached: false });
  } catch (err) {
    console.error("Recommendation error:", err.message);
    return next(new AppError("Recommendations generate nahi ho payi: " + err.message, 500));
  }
}