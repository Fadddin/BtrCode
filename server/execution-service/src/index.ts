import amqp, { Channel, Message } from "amqplib";
import Docker from "dockerode";
import * as stream from "stream";

const docker = new Docker();
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "submission_que";

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
      const { userId, code } = submission;
      console.log(userId);
      

      try {
        const result = await executeCodeInContainer(code);

        // Simulate result storage
        results[userId] = result;
        console.log("Execution result:", result);

        channel.ack(message);
      } catch (error) {
        console.error("Execution error:", error);
        channel.nack(message);
      }
    },
    { noAck: false }
  );
}).catch(console.error);
