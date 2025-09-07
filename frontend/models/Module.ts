import mongoose, { Schema, Document } from "mongoose";

export interface ITopic {
  _id?: mongoose.Types.ObjectId;
  title: string;
  priority: "Low" | "Medium" | "High";
  dueDate?: Date;
  completed: boolean;
}

export interface IModule extends Document {
  userId: string; 
  subjectId: mongoose.Types.ObjectId;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedHours: number;
  completed: boolean;
  topics: ITopic[];
}

const TopicSchema = new Schema<ITopic>(
  {
    title: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
  },
  { _id: true } 
);

const ModuleSchema: Schema<IModule> = new Schema(
  {
    userId: { type: String, required: true },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    name: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    estimatedHours: { type: Number, default: 2 },
    completed: { type: Boolean, default: false },
    topics: { type: [TopicSchema], default: [] }, 
  },
  { timestamps: true }
);

export default mongoose.models.Module ||
  mongoose.model<IModule>("Module", ModuleSchema);
