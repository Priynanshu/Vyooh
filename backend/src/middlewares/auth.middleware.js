import jwt from "jsonwebtoken"
import AppError from "../utils/ApiError.js"
import userModel from "../models/user.model.js"

export const identifyUser = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken

        if(!token) {
            return next(new AppError("unAuthorized Access", 401))
        }

        const decoded = jwt.verify(token, process.env.ACCESS_SECRECT)
        req.user = decoded
        next()
    } catch (error) {
        console.log(error)
        return next(new AppError("Unauthorized Access: Invalid or Expired Token " + error, 401));
    }
}

export const adminCheck = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const admin = await userModel.findById(userId)

        if (!admin) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        if(admin.role === "admin") {
           return next();
        }
        return res.status(401).json({
            message: "Admin can only access"
        })
    } catch (err) {
        return next(new AppError("something went wrong in AdminCheck " + err, 500))
    }
}