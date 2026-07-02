import watchHistoryModel from "../models/watchHistory.model.js";
import AppError from "../utils/ApiError.js";

export async function saveWatchHistory(req, res, next) {
  try {
    const userId = req.user.userId; 
    const { videoId, progress, watchedDuration } = req.body;

    if (!videoId || progress === undefined || watchedDuration === undefined) {
      return next(new AppError("videoId, progress, watchedDuration required hain", 400));
    }

    const updateData = {
      progress,
      watchedDuration,
      lastWatchedAt: new Date(),
    };

    // Completed sirf true karo, kabhi false mat karo
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
    return next(new AppError("Watch history save nahi hui: " + err.message, 500));
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
    return next(new AppError("Watch history fetch nahi hui: " + err.message, 500));
  }
}

export async function getContinueWatching(req, res, next) {
  try {
    const userId = req.user.userId;

    const history = await watchHistoryModel
      .find({
        user: userId,
        completed: false,
        progress: { $gt: 0 }, // kuch to dekha ho
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
    return next(new AppError("Continue watching fetch nahi hui: " + err.message, 500));
  }
}

export async function removeFromHistory(req, res, next) {
  try {
    const userId = req.user.userId;
    const { videoId } = req.params;

    await watchHistoryModel.findOneAndDelete({ user: userId, video: videoId });

    return res.status(200).json({ message: "History se remove kar diya" });
  } catch (err) {
    return next(new AppError("History remove nahi hui: " + err.message, 500));
  }
}

export async function clearAllHistory(req, res, next) {
  try {
    const userId = req.user.userId;

    await watchHistoryModel.deleteMany({ user: userId });

    return res.status(200).json({ message: "Poori history clear ho gayi" });
  } catch (err) {
    return next(new AppError("History clear nahi hui: " + err.message, 500));
  }
}