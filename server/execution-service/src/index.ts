import amqp, { Channel, Message } from "amqplib";
import Docker from "dockerode";
import * as stream from "stream";
import Redis from "ioredis";
import express from "express";

const app = express();
const docker = new Docker();
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const QUEUE_NAME = "submission_que";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(REDIS_URL);
const redisPublisher = new Redis(REDIS_URL);

// Connect to RabbitMQ
async function connectRabbitMQ(): Promise<Channel> {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  return channel;
}

// Wrap user code to inject test cases dynamically
// Wrap user code to inject test cases dynamically and check input type
// Wrap user code to inject test cases dynamically and check input type
function wrapCodeWithTestCases(code: string, testCases: { input: any[]; output: any }[]): string {
  return `
${code}

const testCases = ${JSON.stringify(testCases)};

let results = [];

for (const t of testCases) {
  try {
    console.log("Running test case with input:", t.input); // Debugging log

    // Log the type of the input to verify it's an array
    console.log("Type of input:", typeof t.input); // Should be 'object' for array
    console.log("Array check:", Array.isArray(t.input)); // Should return true if it's an array

    // Ensure that input is an array before calling .map
    if (!Array.isArray(t.input)) {
      throw new Error("Input is not an array");
    }

    const result = userFunction(...t.input); // Spread input array
    const pass = JSON.stringify(result) === JSON.stringify(t.output);
    results.push({ input: t.input, output: t.output, result, pass });
  } catch (err) {
    results.push({ input: t.input, output: t.output, error: err.message });
  }
}

console.log(JSON.stringify(results, null, 2));  // Print nicely formatted results
  `;
}



// Execute code in Docker and return output
async function executeCodeInContainer(code: string, language: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let image = "";
      let cmd: string[] = [];

      // Determine the Docker image and command based on language
      switch (language.toLowerCase()) {
        case "javascript":
          image = "node:14";
          cmd = ["node", "-e", code];
          break;
        case "python":
          image = "python:3.9";
          cmd = ["python", "-c", code];
          break;
        case "java":
          image = "openjdk:11";
          const fileName = "/app/Main.java";
          cmd = [
            "sh",
            "-c",
            `echo '${code}' > ${fileName} && javac ${fileName} && java -cp /app Main`,
          ];
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      // Create the Docker container
      const container = await docker.createContainer({
        Image: image,
        Tty: false,
        Cmd: cmd,
        HostConfig: {
          AutoRemove: true, // Automatically remove the container after execution
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
      resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

// Main service logic
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
          const wrappedCode = wrapCodeWithTestCases(code, testCases);
          const result = await executeCodeInContainer(wrappedCode, language);

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
  })
  .catch(console.error);

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
