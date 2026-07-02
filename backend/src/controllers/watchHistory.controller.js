import watchHistoryModel from "../models/watchHistory.model.js";
import AppError from "../utils/ApiError.js";

export async function saveWatchHistory(req, res, next) {
  try {
    const userId = req.user.userId; 
    const { videoId, progress, watchedDuration } = req.body;

    if (!videoId || progress === undefined || watchedDuration === undefined) {
      return next(new AppError("videoId, progress, and watchedDuration are required", 400));
    }

    const updateData = {
      progress,
      watchedDuration,
      lastWatchedAt: new Date(),
    };

    // Only set completed to true, never to false
    if (progress >= 80) updateData.completed = true;

    const watchHistory = await watchHistoryModel.findOneAndUpdate(
      { user: userId, video: videoId },
      updateData,
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Watch history updated successfully",
      data: watchHistory,
    });
  } catch (err) {
    return next(new AppError("Failed to save watch history: " + err.message, 500));
  }
}

export async function getWatchHistory(req, res, next) {
  try {
    const userId = req.user.userId;

    const history = await watchHistoryModel
      .find({ user: userId })
      .populate("video", "title thumbnail type genres year status")
      .sort({ lastWatchedAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Watch history fetched successfully",
      data: history,
    });
  } catch (err) {
    return next(new AppError("Failed to fetch watch history: " + err.message, 500));
  }
}

export async function getContinueWatching(req, res, next) {
  try {
    const userId = req.user.userId;

    const history = await watchHistoryModel
      .find({
        user: userId,
        completed: false,
        progress: { $gt: 0 }, // only if they have watched something
      })
      .populate("video", "title thumbnail type genres year status masterPlaylistKey")
      .sort({ lastWatchedAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      message: "Continue watching fetched successfully",
      data: history,
    });
  } catch (err) {
    return next(new AppError("Failed to fetch continue watching: " + err.message, 500));
  }
}

export async function removeFromHistory(req, res, next) {
  try {
    const userId = req.user.userId;
    const { videoId } = req.params;

    await watchHistoryModel.findOneAndDelete({ user: userId, video: videoId });

    return res.status(200).json({ message: "Removed from history successfully" });
  } catch (err) {
    return next(new AppError("Failed to remove from history: " + err.message, 500));
  }
}

export async function clearAllHistory(req, res, next) {
  try {
    const userId = req.user.userId;

    await watchHistoryModel.deleteMany({ user: userId });

    return res.status(200).json({ message: "Watch history cleared successfully" });
  } catch (err) {
    return next(new AppError("Failed to clear watch history: " + err.message, 500));
  }
}