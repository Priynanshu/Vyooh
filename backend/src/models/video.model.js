import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    source: {type: String, default: "streamFlix"},
    url: {type: String},
    videoId: {type: String},
    description: { type: String },
    type: { type: String, enum: ["movie", "series"], default: "movie" },
    genres: [{ type: String }],
    year: { type: Number },
    rating: { type: String },
    ratingCount: { type: Number, default: 0 },
    thumbnail: {type: String},

    rawKey: { type: String }, // raw uploaded file ka R2/B2 key
    status: {
      type: String,
      enum: ["pending", "queued", "transcoding", "ready", "failed"],
      default: "pending",
    },

    resolutions: [
      {
        quality: { type: String }, // "480p", "720p"
        key: { type: String },     // processed file ka B2 key
      },
    ],

    masterPlaylistKey: { type: String },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const videoModel = mongoose.model("Video", videoSchema)

export default videoModel;