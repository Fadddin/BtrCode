import express from "express";
import {
  createContest,
  getContestById,
  getAllContests,
  updateContest,
  deleteContest,
} from "../controllers/contestController";

const router = express.Router();

// Route to create a contest
router.post("/", createContest);

// Route to get all contests
router.get("/", getAllContests);

// Route to get a contest by ID
router.get("/:id", getContestById);

// Route to update a contest by ID
router.put("/:id", updateContest);

// Route to delete a contest by ID
router.delete("/:id", deleteContest);

export default router;
