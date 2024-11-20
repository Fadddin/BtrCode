import express from "express";
import { createQuestion, getQuestionById, updateQuestion, deleteQuestion, getAllQuestions } from "../controllers/questionController";

const router = express.Router();

// Route to create a question
router.post("/", createQuestion);

// Route to get all questions
router.get("/", getAllQuestions);

// Route to get a single question by ID
router.get("/:id", getQuestionById);

// Route to update a question by ID
router.put("/:id", updateQuestion);

// Route to delete a question by ID
router.delete("/:id", deleteQuestion);

export default router;
