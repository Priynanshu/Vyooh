import videoModel from "../models/video.model.js"
import userModel from "../models/user.model.js"
import AppError from "../utils/ApiError.js"

export async function createRating(req, res, next) {
    try {
        const { id } = req.params
        const { rating } = req.body

        if (typeof rating !== "number" || rating < 0 || rating > 5) {
            return next(new AppError("Give rating must be under 0 to 5", 400))
        }
        const video = await videoModel.findById(id)

        if (!video) {
            return next(new AppError("video not found", 404))
        }

        const totalRating = video.rating * video.ratingCount;

        const newTotalRating = totalRating + rating;

        const newCount = video.ratingCount + 1;

        video.rating = newTotalRating / newCount;
        video.ratingCount = newCount;

        await video.save();

        return res.status(200).json({
            message: "Rating Added",
            data: video
        })

    } catch (err) {
        return next(new AppError("something went wrong in createReview " + err, 500))
    }
}


export async function deleteRating(req, res, next) {
    try {
        const {id} = req.params

        const video = await videoModel.findById(id)

        if(!video) {
            return next(new AppError("video not found", 404))
        }

        video.rating = 0;
        video.ratingCount = 0;
        await video.save();

        return res.status(200).json({
            message: "All Rating Deleted of a single video successfully",
            data: video
        })
    }catch(err) {
        return next(new AppError("something went wrong in delete rating " + err, 500))
    }
}