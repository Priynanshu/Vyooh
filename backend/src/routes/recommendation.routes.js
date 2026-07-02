// recommendation.routes.js
import express from "express";
import { getRecommendations } from "../controllers/recommendation.controller.js";
import { identifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/", identifyUser, getRecommendations);

export default router;