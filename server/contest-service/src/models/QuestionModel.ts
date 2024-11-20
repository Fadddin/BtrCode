import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface for the Question document
interface IQuestion extends Document {
  title: string;
  description: string;
  difficultyLevel: "Easy" | "Medium" | "Hard";
  tags: string[];

  inputDescription: string;
  outputDescription: string;
  constraints: string[];

  broilerPlateCode: {
    [language: string]: string;  // e.g., "Python": "...", "JavaScript": "..."
  };

  exampleCases: {
    exampleInput: string;
    exampleOutput: string;
    explanation?: string;
  }[];

  publicTestCases: {
    input: string;
    expectedOutput: string;
  }[];

  hiddenTestCases: {
    input: string;
    expectedOutput: string;
    description?: string;
  }[];

  scoring: {
    points: number;
  };

  hints?: string[];
  relatedProblems?: mongoose.Types.ObjectId[];

  author: string;
  createdDate: Date;
  lastUpdatedDate: Date;

  editorial?: {
    text: string;
    solutionCode: string;
  };
}

// Define the Mongoose Schema
const QuestionSchema: Schema = new Schema<IQuestion>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficultyLevel: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  tags: [
    {
      type: String,
      required: true,
    },
  ],
  inputDescription: {
    type: String,
    required: true,
  },
  outputDescription: {
    type: String,
    required: true,
  },
  constraints: [
    {
      type: String,
      required: true,
    },
  ],

  broilerPlateCode: {
    type: Map, // Using a Map to represent key-value pairs of languages and code
    of: String, // Each key is a language and the value is a string representing the code
    required: true,
  },
  
  exampleCases: [
    {
      exampleInput: { type: String, required: true },
      exampleOutput: { type: String, required: true },
      explanation: { type: String },
    },
  ],
  publicTestCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
    },
  ],
  hiddenTestCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      description: { type: String },
    },
  ],
  scoring: {
    points: { type: Number, required: true },
  },
  hints: [{ type: String }],
  relatedProblems: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  author: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastUpdatedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  editorial: {
    text: { type: String },
    solutionCode: { type: String },
  },
});

// Creating the Mongoose model
const Question: Model<IQuestion> = mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
