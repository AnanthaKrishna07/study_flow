import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  color: string;
  totalModules: number;
  completedModules: number;
  userId: mongoose.Types.ObjectId;
}

const SubjectSchema: Schema<ISubject> = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, default: "#3B82F6" },
    totalModules: { type: Number, default: 0 },
    completedModules: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);
