import express, { Request, Response } from "express";
import mongoose from "mongoose";
import questionRoutes from "./routes/questionRoutes";
import contestRoutes from "./routes/contestRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || '';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });


app.use("/questions", questionRoutes);
app.use("/contest", contestRoutes);


app.get("/", (req: Request, res: Response) => {
    res.send("contest is running");
});

app.listen(PORT, () => {
    console.log(`contest running on port ${PORT}`);
});
