import express from "express"
import {registerUser, loginUser, getMe, logoutUser, refreshAccessToken} from "../controllers/auth.controller.js"
import {identifyUser} from "../middlewares/auth.middleware.js"
import {authRateLimit} from "../middlewares/ratelimit.middleware.js"
import {validateRegister, validateLogin, checkValidation} from "../validator/auth.validator.js"

const router = express.Router()

router.post("/register", authRateLimit, validateRegister, checkValidation, registerUser)
router.post("/login", validateLogin, checkValidation, loginUser)
router.get("/getMe", authRateLimit, identifyUser, getMe)
router.post("/logout", authRateLimit, identifyUser, logoutUser)
router.post("/refresh", authRateLimit, refreshAccessToken)
 
export default router 