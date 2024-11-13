// src/index.ts
import express, { Request, Response } from "express";
import dotenv from "dotenv";

// Import route handlers
import userRoutes from "./routes/userRoutes";
import contestRoutes from "./routes/contestRoutes";
import problemRoutes from "./routes/problemRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Define routes for each microservice
app.use("/api/users", userRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/problems", problemRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("API Gateway is running!");
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
