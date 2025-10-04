import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  settings?: {
    emailReminders: boolean;
    studyHoursPerDay: number;
    preferredStudyTimes: string[];
    difficultyWeights: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
  };
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  settings: {
    emailReminders: { type: Boolean, default: false },
    studyHoursPerDay: { type: Number, default: 2 },
    preferredStudyTimes: [{ type: String }],
    difficultyWeights: {
      Easy: { type: Number, default: 1 },
      Medium: { type: Number, default: 1 },
      Hard: { type: Number, default: 1 },
    },
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
