import express from "express"
import {identifyUser} from "../middlewares/auth.middleware.js"
import {saveWatchHistory, getWatchHistory,getContinueWatching, removeFromHistory, clearAllHistory} from "../controllers/watchHistory.controller.js"

const router = express.Router()

router.post("/save", identifyUser, saveWatchHistory)
router.get("/history", identifyUser, getWatchHistory)
router.get("/continue", identifyUser, getContinueWatching);
router.delete("/:videoId", identifyUser, removeFromHistory);
router.delete("/", identifyUser, clearAllHistory);


export default router