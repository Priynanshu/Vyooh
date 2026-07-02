import express from "express";
import { getStreamUrl, streamHLSFile, getVideoStatus, getAllVideos, getVideoDetails, editVideoDetails, deleteVideo } from "../controllers/video.controller.js";
import {identifyUser, adminCheck} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.get("/:id/stream", identifyUser, getStreamUrl);
router.get("/:id/hls/*splat", identifyUser, streamHLSFile);
router.get("/:id/status", identifyUser, getVideoStatus);
router.get("/videos", identifyUser, getAllVideos)
router.get("/:id", identifyUser, getVideoDetails)
router.patch("/edit/:id", identifyUser, adminCheck, editVideoDetails)
router.delete("/delete/:id", identifyUser, adminCheck, deleteVideo)


export default router;