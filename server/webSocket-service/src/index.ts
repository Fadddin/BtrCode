import WebSocket, { WebSocketServer } from "ws";
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const WEBSOCKET_PORT = Number(process.env.WEBSOCKET_PORT) || 8080;

// Redis client for subscribing to result updates
const redisSubscriber = createClient({ url: REDIS_URL });

redisSubscriber.on("error", (err) => {
  console.error("Redis subscriber error:", err);
});

(async () => {
  await redisSubscriber.connect();
  console.log("Connected to Redis for subscribing.");
})();

// Create a WebSocket server
const wss = new WebSocketServer({ port: WEBSOCKET_PORT });

console.log(`WebSocket Server running on ws://localhost:${WEBSOCKET_PORT}`);

// Map to keep track of user connections
const userConnections: Map<string, WebSocket> = new Map();

// Handle new WebSocket connections
wss.on("connection", (ws: WebSocket, req) => {
  console.log("New WebSocket connection established.");

  // Parse the query string for userId and contestId
  const queryParams = new URLSearchParams(req.url?.split("?")[1]);
  const userId = queryParams.get("userId");
  const contestId = queryParams.get("contestId");

  if (!userId || !contestId) {
    ws.close(1008, "UserId and ContestId are required for WebSocket connection.");
    console.error("Connection rejected: UserId or ContestId is missing.");
    return;
  }

  // Generate a unique key for userId and contestId
  const subscriptionKey = `${userId}:${contestId}`;

  // Store the connection
  userConnections.set(subscriptionKey, ws);
  console.log(`Connection established for userId: ${userId}, contestId: ${contestId}`);

  // Handle connection close
  ws.on("close", () => {
    userConnections.delete(subscriptionKey);
    console.log(`Connection closed for userId: ${userId}, contestId: ${contestId}`);
  });

  // Handle incoming WebSocket messages (optional)
  ws.on("message", (message) => {
    console.log(`Received message from userId ${userId}, contestId ${contestId}:`, message.toString());
  });
});

// Subscribe to Redis for result updates dynamically for all user-contest combinations
(async () => {
  await redisSubscriber.pSubscribe("*:*", (message, channel) => {
    console.log(`Received result from Redis on channel ${channel}:`, message);

    // channel is in the format userId:contestId
    const subscriptionKey = channel;

    // Send the result to the corresponding WebSocket client
    const client = userConnections.get(subscriptionKey);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ result: message }));
      console.log(`Result sent to userId and contestId ${subscriptionKey}:`, message);
    } else {
      console.warn(`No active WebSocket connection for userId and contestId ${subscriptionKey}`);
    }
  });
})();
