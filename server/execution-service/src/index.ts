import amqp, { Channel, Message } from "amqplib";
import Docker from "dockerode";
import Redis from "ioredis";
import express from "express";
import * as stream from "stream";

const app = express();
const docker = new Docker();
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const QUEUE_NAME = "submission_que";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(REDIS_URL);
const redisPublisher = new Redis(REDIS_URL);

// Function Wrapper Template
const functionWrapperCode = `
const runUserFunction = (userFunction, testCases) => {
  const results = [];

  for (const testCase of testCases) {
    try {
      let result;
      

      // Determine if the function expects multiple arguments
      if (typeof testCase.input === 'object' && Array.isArray(testCase.input)) {
        if (userFunction.length === testCase.input.length) {
          // Spread if the number of function parameters matches input length
          result = userFunction(...testCase.input);
        } else {
          // Pass array directly if the function expects one argument
          result = userFunction(testCase.input);
        }
      } else {
        // Handle single non-array inputs
        result = userFunction(testCase.input);
      }

      const pass = JSON.stringify(result) === JSON.stringify(testCase.output);
      results.push({ input: testCase.input, output: testCase.output, result, pass });
    } catch (error) {
      results.push({ input: testCase.input, output: testCase.output, error: error.message });
    }
  }

  console.log(JSON.stringify(results, null, 2));
};


`;

// Connect to RabbitMQ
async function connectRabbitMQ(): Promise<Channel> {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  return channel;
}

// Function to generate complete code for execution
function generateExecutionCode(userFunction: string, testCases: { input: any[]; output: any }[]) {
  return `
    ${functionWrapperCode}

    // User Function
    const userFunction = ${userFunction};

    // Test Cases
    const testCases = ${JSON.stringify(testCases)};

    // Run the Function
    runUserFunction(userFunction, testCases);
  `;
}

// Execute the code inside Docker
async function executeCodeInContainer(code: string, language: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let image = "";
      let cmd: string[] = [];

      switch (language.toLowerCase()) {
        case "javascript":
          image = "node:14";
          cmd = ["node", "-e", code];
          break;
        case "python":
          image = "python:3.9";
          cmd = ["python", "-c", code];
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      const container = await docker.createContainer({
        Image: image,
        Tty: false,
        Cmd: cmd,
        HostConfig: {
          AutoRemove: true,
        },
      });

      const outputStream = new stream.PassThrough();
      let output = "";

      outputStream.on("data", (data) => {
        output += data.toString();
      });

      await container.start();
      const attachResult = await container.attach({
        stream: true,
        stdout: true,
        stderr: true,
      });

      if (attachResult) {
        attachResult.pipe(outputStream);
      } else {
        throw new Error("Failed to attach to container output stream.");
      }

      await container.wait();
      resolve(output.trim());
    } catch (error) {
      reject(error);
    }
  });
}

// Main Service Logic
connectRabbitMQ()
  .then((channel) => {
    console.log("Execution Service is running and connected to RabbitMQ.");

    channel.consume(
      QUEUE_NAME,
      async (message: Message | null) => {
        if (!message) return;

        const submission = JSON.parse(message.content.toString());
        const { userId, code, contestId, language, testCases } = submission;

        try {
          const executionCode = generateExecutionCode(code, testCases);
          const result = await executeCodeInContainer(executionCode, language);

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
  })
  .catch(console.error);

// API for result retrieval
app.use(express.json());

app.get("/result/:userId/:contestId", async (req, res) => {
  const { userId, contestId } = req.params;

  try {
    const resultKey = `${userId}:${contestId}`;
    const result = await redis.get(resultKey);

    if (result) {
      res.status(200).json({ status: "success", result: JSON.parse(result) });
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
