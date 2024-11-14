import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const SALT_ROUNDS = 10;

const router = express.Router();

router.get('/', (req: any, res: any) => {
  res.send("Users running fine")
})

// Register route
router.post("/register", async (req : any, res : any) => {
    try {
        const { username, email, password, profile } = req.body;
    
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" });
        }
    
        // Hash the password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
        // Create a new user with the provided details
        const newUser = new User({
          username,
          email,
          passwordHash,
          role: "user", // default role is "user"
          profile: {
            fullName: profile.fullName,
            bio: profile.bio,
            country: profile.country,
            avatarUrl: profile.avatarUrl,
          },
          contestsParticipated: [], // Initialize empty arrays for the required fields
          submissions: [],
          dateJoined: new Date(),
          lastLogin: new Date(),
        });
    
        // Save the user to the database
        await newUser.save();
    
        // Generate a JWT token for the new user
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, {
          expiresIn: "5h",
        });
    
        // Return a success message along with the token
        return res.status(201).json({
          message: "User registered successfully",
          token,
        });
      } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ error: error });
      }
});

// Login route
router.post("/login", async (req:any , res:any) => {
    try {
        const { email, password } = req.body;
    
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
    
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
          expiresIn: "5h",
        });
    
        return res.json({ message: "Login successful", token });
      } catch (error) {
        return res.status(500).json({ error: "Login failed" });
      }
})

export default router;
