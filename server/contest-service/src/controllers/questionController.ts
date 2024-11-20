import { Request, Response, NextFunction, RequestHandler } from "express";
import Question from "../models/QuestionModel";

// Create a Question
export const createQuestion: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newQuestion = new Question(req.body);
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion); // Do not use return here
  } catch (error) {
    next(error); // Forward the error to the error handler
  }
};

// Get a Question by ID
export const getQuestionById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      res.status(404).json({ message: "Question not found" });
    } else {
      res.status(200).json(question); 
    }
  } catch (error) {
    next(error);
  }
};

// Get All Questions
export const getAllQuestions: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions); // Respond with the data
  } catch (error) {
    next(error);
  }
};

// Update a Question
export const updateQuestion: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedQuestion) {
      res.status(404).json({ message: "Question not found" });
    } else {
      res.status(200).json(updatedQuestion);
    }
  } catch (error) {
    next(error);
  }
};

// Delete a Question
export const deleteQuestion: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      res.status(404).json({ message: "Question not found" });
    } else {
      res.status(200).json({ message: "Question deleted successfully" });
    }
  } catch (error) {
    next(error);
  }
};
