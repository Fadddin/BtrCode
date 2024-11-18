import express from "express";
import Redis from "ioredis";

const app = express();
const PORT = process.env.PORT || 4001;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(REDIS_URL);

app.use(express.json());

// API to fetch the result
app.get("/result/:userId/:contestId", async (req, res) => {
  const { userId, contestId } = req.params;

  try {
    // Retrieve result from Redis
    const resultKey = `${userId}:${contestId}`;
    const result = await redis.get(resultKey);

    if (result) {
      res.status(200).json({ status: "success", result });
    } else {
      res.status(404).json({ status: "error", message: "Result not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error });
  }
});

app.listen(PORT, () => {
  console.log(`Result API Service running on port ${PORT}`);
});
