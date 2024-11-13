// src/routes/contestRoutes.ts
import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();
const CONTEST_SERVICE_URL = process.env.CONTEST_SERVICE_URL || "http://localhost:3002";

router.get("/", async (req: Request, res: Response) => {
    try {
        const response = await axios.get(`${CONTEST_SERVICE_URL}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send("Contest Service is unavailable");
    }
});

// Other contest routes like contest creation, updates, etc.

export default router;
