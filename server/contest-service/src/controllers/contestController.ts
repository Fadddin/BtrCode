import { Request, Response, NextFunction } from "express";
import Contest from "../models/ContestModel";

// Create a Contest
export const createContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newContest = new Contest(req.body);
    const savedContest = await newContest.save();
    res.status(201).json(savedContest);
  } catch (error) {
    next(error);
  }
};

// Get a Contest by ID
export const getContestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
       res.status(404).json({ message: "Contest not found" });
    }
    res.status(200).json(contest);
  } catch (error) {
    next(error);
  }
};

// Get All Contests
export const getAllContests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contests = await Contest.find();
    res.status(200).json(contests);
  } catch (error) {
    next(error);
  }
};

// Update a Contest by ID
export const updateContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedContest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedContest) {
        res.status(404).json({ message: "Contest not found" });
    }
    res.status(200).json(updatedContest);
  } catch (error) {
    next(error);
  }
};

// Delete a Contest by ID
export const deleteContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedContest = await Contest.findByIdAndDelete(req.params.id);
    if (!deletedContest) {
        res.status(404).json({ message: "Contest not found" });
    }
    res.status(200).json({ message: "Contest deleted successfully" });
  } catch (error) {
    next(error);
  }
};
