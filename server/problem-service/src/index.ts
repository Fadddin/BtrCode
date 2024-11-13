// src/index.ts

import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
    res.send("problems is running");
});

app.listen(PORT, () => {
    console.log(`problems running on port ${PORT}`);
});
