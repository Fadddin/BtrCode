// src/index.ts

import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
    res.send("contest is running");
});

app.listen(PORT, () => {
    console.log(`contest running on port ${PORT}`);
});
