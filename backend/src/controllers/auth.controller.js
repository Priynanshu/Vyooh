import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import cookie from "cookie-parser"
import AppError from "../utils/ApiError.js"

export const registerUser = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body
        if (!username || !email || !password) {
            return next(new AppError("All fields are required", 400));
        }

        const exsitingUser = await userModel.findOne({ email })
        if (exsitingUser) {
            return next(new AppError("User Already Existed", 400))
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.create({
            username,
            email,
            password: hashPassword,
            role
        })

        // If the frontend redirects the user to login after registration, there is no need to generate access and refresh tokens. However, if redirecting straight to home, tokens must be generated.

        return res.status(201).json({
            message: "User Registerd Successfully",
            user: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            },
            token
        })
    } catch (error) {
        console.log(error)
        next()
    }
}

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return next(new AppError("All fields are required", 400));
        }

        const user = await userModel.findOne({ email }).select("+password")
        if (!user) {
            return next(new AppError("User not Found", 404))
        }

        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            return next(new AppError("Invalid Credentials", 400))
        }

        const accessToken = jwt.sign({
            userId: user._id,
            email: user.email
        }, process.env.ACCESS_SECRECT, { expiresIn: "10min" })

        const refreshToken = jwt.sign({
            userId: user._id,
            email: user.email
        }, process.env.REFRESH_SECRECT, { expiresIn: "7d" })

        user.refreshToken = refreshToken;
        await user.save()

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60 * 1000 // 15 minute
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,     // Prevents client-side scripts from reading the cookie (blocks XSS)
            secure: process.env.NODE_ENV === "production",       // Ensures cookie is only sent over HTTPS (use true in production)
            sameSite: "strict", // Protects against Cross-Site Request Forgery (CSRF) attacks
            maxAge: 24 * 60 * 60 * 1000 // Cookie expiry time in milliseconds (e.g., 1 day)
        });

        return res.status(200).json({
            message: "User Login Successfully",
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            },
            accessToken
        })
    } catch (error) {
        console.log(error)
        next()
    }
}

export const getMe = async (req, res, next) => {
    try {
        const userId = req.user.userId

        const user = await userModel.findById(userId).select("-refreshToken");

        if (!user) {
            return next(new AppError("user not found", 404))
        }

        return res.status(200).json({
            message: "User fetch successfully",
            user
        })
    } catch (error) {
        next()
    }
}

export const logoutUser = async (req, res, next) => {
    try {
        await userModel.findByIdAndUpdate(req.user.userId, { refreshToken: null })
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            message: "user logout successfully"
        })
    } catch (error) {
        next(new AppError("Logout Failed "+ error, 401))
    }
}

export const refreshAccessToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken

        if (!token) {
            return next(new AppError("There is no RefreshToken", 401))
        }

        const decoded = jwt.verify(token, process.env.REFRESH_SECRECT)
        const user = await userModel.findById(decoded.userId)

        if (!user || user.refreshToken !== token) {
            return next(new AppError("Invalid refresh token", 401));
        }

        const newAccessToken = jwt.sign({
            userId: user._id,
            email: user.email
        }, process.env.ACCESS_SECRECT, { expiresIn: "10min" })

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60 * 1000 // 15 minute
        });

        return res.json({
            accessToken: newAccessToken
        })
    } catch (err) {
        return next(new AppError("Refresh Token is expired or Invalid " + err, 401))
    }
}