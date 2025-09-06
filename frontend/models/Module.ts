import mongoose, { Schema, Document } from "mongoose";

export interface IModule extends Document {
  userId: string; 
  subjectId: mongoose.Types.ObjectId;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedHours: number;
  completed: boolean;
}

const ModuleSchema: Schema<IModule> = new Schema(
  {
    userId: { type: String, required: true }, 
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    name: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    estimatedHours: { type: Number, default: 2 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Module ||
  mongoose.model<IModule>("Module", ModuleSchema);
