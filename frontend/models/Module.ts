import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopic {
  _id?: Types.ObjectId;
  title: string;
  priority: "Low" | "Medium" | "High";
  dueDate?: Date;
  completed: boolean;
}

export interface IModule extends Document {
  userId: Types.ObjectId; 
  subjectId: Types.ObjectId; 
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

const ModuleSchema = new Schema<IModule>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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

const Module =
  (mongoose.models.Module as mongoose.Model<IModule>) ||
  mongoose.model<IModule>("Module", ModuleSchema);

export default Module;
