// src/index.ts

import express, { Request, Response } from "express";
import amqp from "amqplib";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3003;
app.use(cors());

type TestCase = {
  input: any[];
  output: any;
};

type Submission = {
  userId: string;
  contestId: string;
  code: string;
  language: string;
  testCases: TestCase[];
  submittedAt: number;
};

app.use(bodyParser.json());

const RABBITMQ_URL = "amqp://localhost:5672";
const QUEUE_NAME = "submission_que";

async function connectToRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);
  return channel;
}

connectToRabbitMQ().then((channel) => {
  app.post("/submit", async (req: any, res: any) => {
    const { userId, contestId, code, language, testCases } = req.body;

    // if (!testCases || !Array.isArray(testCases)) {
    //   return res.status(400).json({
    //     message: "Test cases are required and must be an array",
    //   });
    // }

    const submission: Submission = {
      userId,
      contestId,
      code,
      language,
      testCases,
      submittedAt: Date.now(),
    };

    await channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(submission)), {
      persistent: true, // Ensure the message is not lost even if RabbitMQ crashes
    });

    res.status(201).json({ message: "Submission received", submission });
  });

  app.listen(3003, () => {
    console.log(`problems running hella fine on port ${PORT}`);
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("problems is running on fireee");
});
