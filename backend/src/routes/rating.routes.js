import express from "express"
import {createRating, deleteRating} from "../controllers/rating.controller.js"
import {identifyUser, adminCheck} from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/give-rating/:id", identifyUser, createRating)
router.delete("/delete/:id", identifyUser, adminCheck, deleteRating)

export default router