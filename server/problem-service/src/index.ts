// src/index.ts

import express, { Request, Response } from "express";
import amqp from "amqplib"
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3003;

type submission = {
    userId : string;
    contestId : string;
    code : string;
    language : string,
    submittedAt : number;
}

app.use(bodyParser.json());

const RABBITMQ_URL = "amqp://localhost:5672";
const QUEUE_NAME = "submission_que"

async function connectToRabbitMQ() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME);
    return channel;
}

connectToRabbitMQ().then((channel) => {
    app.post('/submit', async(req:Request, res:Response) => {
        const { userId, contestId , code , language} = req.body;

        const submission: submission = {userId, contestId, code, language, submittedAt: Date.now()}

        await channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(submission)), {
            persistent: true  // Ensure the message is not lost even if RabbitMQ crashes
        })

        res.status(201).json({ message: "Submission received", submission });
    })

    app.listen(3003, () => {
        console.log(`problems running hella fine on port ${PORT}`);
    })

//     app.get('/:userId', (req : any , res : any) => {
//         const { userId } = req.params;
//   const result = results[userId];

//   if (result) {
//     res.json({ result });
//     delete results[userId]; // Clean up after sending the result
//   } else {
//     res.status(404).json({ message: "Result not yet available" });
//   }

//     })
})

app.get("/", (req: Request, res: Response) => {
    res.send("problems is running on fireee");
});

