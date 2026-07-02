import express from "express";
import multer from "multer"
import { getUploadUrl, markUploadComplete, uploadYTVideo, directUpload } from "../controllers/upload.controller.js";
import {identifyUser, adminCheck} from "../middlewares/auth.middleware.js"
const upload = multer({
  storage: multer.memoryStorage(), // RAM mein store karo temporarily
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});


const router = express.Router();

router.post("/presigned-url", identifyUser, adminCheck, getUploadUrl);
router.post("/complete", identifyUser, adminCheck, markUploadComplete);
router.post("/upload-ytvideo", identifyUser, adminCheck, uploadYTVideo)

router.post("/direct", identifyUser, adminCheck, upload.single("video"), directUpload);

export default router;