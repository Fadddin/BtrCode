import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import dotenv from 'dotenv';
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 3001;

dotenv.config();

app.use(express.json());
app.use(cors());

app.use("/", userRoutes);

mongoose
  .connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
  })
  .catch((error) => console.error("MongoDB connection error:", error));
