import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface for the Contest document
interface IContest extends Document {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number; // Duration in minutes

  questions: {
    questionId: mongoose.Types.ObjectId;
    points: number;
  }[];

  participants: {
    userId: mongoose.Types.ObjectId;
    username: string;
    score: number;
    submissionTimes: {
      questionId: mongoose.Types.ObjectId;
      submissionTime: Date;
    }[];
  }[];

  status: "Upcoming" | "Ongoing" | "Ended";

  createdDate: Date;
  updatedDate: Date;
  author: string;
}

// Define the Mongoose Schema
const ContestSchema: Schema = new Schema<IContest>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  questions: [
    {
      questionId: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      points: {
        type: Number,
        required: true,
      },
    },
  ],
  participants: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        default: 0,
      },
      submissionTimes: [
        {
          questionId: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
          },
          submissionTime: {
            type: Date,
            required: true,
          },
        },
      ],
    },
  ],
  status: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Ended"],
    required: true,
    default: "Upcoming",
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: String,
    required: true,
  },
});

// Creating the Mongoose model
const Contest: Model<IContest> = mongoose.model<IContest>("Contest", ContestSchema);

export default Contest;
