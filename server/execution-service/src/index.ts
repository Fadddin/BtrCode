import amqp, { Channel, Message } from "amqplib";
import Docker from "dockerode";
import * as stream from "stream";
import Redis from "ioredis";
import express from "express";

const app = express();

const docker = new Docker();
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "submission_que";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(REDIS_URL);
const redisPublisher = new Redis(REDIS_URL);

const results: { [key: string]: string } = {}; 

// Connect to RabbitMQ
async function connectRabbitMQ(): Promise<Channel> {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  return channel;
}

// Execute code in Docker and return output
async function executeCodeInContainer(code: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const container = await docker.createContainer({
        Image: "node:14",
        Tty: false,
        Cmd: ["node", "-e", code],
      });

      const outputStream = new stream.PassThrough();
      let output = "";

      outputStream.on("data", (data) => {
        output += data.toString();
      });

      await container.start();
      const attachResult = await container.attach({ stream: true, stdout: true, stderr: true });
      if (attachResult) {
        attachResult.pipe(outputStream);
      } else {
        throw new Error("Failed to attach to container output stream.");
      }

      await container.wait();
      await container.remove();
      resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

// Main service logic
connectRabbitMQ().then((channel) => {
  console.log("Execution Service is running and connected to RabbitMQ.");

  channel.consume(
    QUEUE_NAME,
    async (message: Message | null) => {
      if (!message) return;

      const submission = JSON.parse(message.content.toString());
      const { userId, code, contestId } = submission;
      console.log(userId);
      

      try {
        const result = await executeCodeInContainer(code);

        // Publish result to Redis Pub/Sub channel
        const resultChannel = `${userId}:${contestId}`;
        await redisPublisher.publish(resultChannel, result);
        console.log("Execution result published:", result);

        channel.ack(message);
      } catch (error) {
        console.error("Execution error:", error);
        channel.nack(message);
      }
    },
    { noAck: false }
  );
}).catch(console.error);

app.use(express.json());

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

app.listen(4000, () => {
  console.log("Execution API Service running on port 4000");
});

//function addTwoNumbers(a, b) { return a + b; } const [a, b] = input.split(' ').map(Number); console.log(addTwoNumbers(a, b));
