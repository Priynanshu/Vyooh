import mongoose from "mongoose"

const watchHistorySchema = new mongoose.Schema({
    user: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    video: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    progress: {
        type: Number,
        default: 0
    },
    watchedDuration: {
        type: Number
    },
    lastWatchedAt: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

// Ek user ek video ke liye ek hi history record rakhega
watchHistorySchema.index({ user: 1, video: 1 }, { unique: true });

const watchHistoryModel = mongoose.model("WatchHistory", watchHistorySchema)
export default watchHistoryModel