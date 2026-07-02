import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const transcodeQueue = new Queue("transcode", {
  connection: redisConnection,
});