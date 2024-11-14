import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Register a new user
export const registerUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const newUser = new User({ username, email, passwordHash: password });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed" });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
};
