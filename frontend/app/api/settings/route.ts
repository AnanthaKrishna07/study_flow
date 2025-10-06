import mongoose, { Schema, Document } from 'mongoose';

/**
 * User interface defining user structure in MongoDB
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  settings?: {
    studyHoursPerDay: number;
    preferredStudyTimes: string[];
    difficultyWeights: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
    dailyGoalHours: number; // new field for goal tracking
  };
}

/**
 * Mongoose schema for the User model
 */
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },

    // Updated settings field (removed focusMode, added dailyGoalHours)
    settings: {
      studyHoursPerDay: { type: Number, default: 2 },
      preferredStudyTimes: [{ type: String }],
      difficultyWeights: {
        Easy: { type: Number, default: 1 },
        Medium: { type: Number, default: 1 },
        Hard: { type: Number, default: 1 },
      },
      dailyGoalHours: { type: Number, default: 4 }, // added for daily study goal tracker
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt fields
  }
);

/**
 * Export User model (reuse if already compiled)
 */
const User =
  mongoose.models?.User || mongoose.model<IUser>('User', UserSchema);

export default User;
