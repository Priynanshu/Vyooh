import dotenv from 'dotenv';
dotenv.config();   
import express from "express"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import errorHandler from "./middlewares/errorHandling.middleware.js"
import authRoutes from "./routes/auth.routes.js"
import uploadRoutes from "./routes/upload.routes.js"
import videoRoutes from "./routes/video.routes.js";
import rateRoutes from "./routes/rating.routes.js"
import watchHistoryRoutes from "./routes/watchHistory.routes.js"
import recommendationRoutes from "./routes/recommendation.routes.js"
import {generalLimiter} from "./middlewares/ratelimit.middleware.js"

const app = express()

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true ,
    exposedHeaders: ['set-cookie']
}))

app.use(express.json())
app.use(generalLimiter)
app.use(cookieParser()) 
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {

  app.use(morgan('combined'));
}

// app.use(mongoSanitize()); //not available for express version 5
app.use(compression());

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/video", videoRoutes);
app.use("/api/rate", rateRoutes)
app.use("/api/watchistory", watchHistoryRoutes)
app.use("/api/recommendations", recommendationRoutes);

// Error Handler 
app.use(errorHandler)

export default app