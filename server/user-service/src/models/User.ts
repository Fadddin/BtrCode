import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IProfile {
  fullName: string;
  bio: string;
  country: string;
  avatarUrl: string;
}

interface IContestParticipation {
  contestId: mongoose.Schema.Types.ObjectId;
  participationDate: Date;
  highestScore: number;
  rank: number;
}

interface ISubmission {
  contestId: mongoose.Schema.Types.ObjectId;
  problemId: mongoose.Schema.Types.ObjectId;
  score: number;
  submissionDate: Date;
  status: string;
}

interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  profile: IProfile;
  contestsParticipated: IContestParticipation[];
  submissions: ISubmission[];
  dateJoined: Date;
  lastLogin: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const ProfileSchema = new Schema<IProfile>({
  fullName: { type: String, required: true },
  bio: { type: String },
  country: { type: String },
  avatarUrl: { type: String },
});

const ContestParticipationSchema = new Schema<IContestParticipation>({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
  participationDate: { type: Date, required: true },
  highestScore: { type: Number, required: true },
  rank: { type: Number, required: true },
});

const SubmissionSchema = new Schema<ISubmission>({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  score: { type: Number, required: true },
  submissionDate: { type: Date, required: true },
  status: { type: String, required: true },
});

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profile: { type: ProfileSchema, required: true },
  contestsParticipated: [ContestParticipationSchema],
  submissions: [SubmissionSchema],
  dateJoined: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
