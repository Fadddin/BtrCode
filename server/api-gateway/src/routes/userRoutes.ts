// src/routes/userRoutes.ts
import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";

router.get("/", async (req: Request, res: Response) => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send("User Service is unavailable");
    }
});

// Other user routes go here, such as user creation, login, etc.

export default router;
