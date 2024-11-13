// src/routes/problemRoutes.ts
import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();
const PROBLEM_SERVICE_URL = "http://problem-service:3003";

router.get("/", async (req: Request, res: Response) => {
    try {
        const response = await axios.get(`${PROBLEM_SERVICE_URL}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Additional problem routes for CRUD operations

export default router;
