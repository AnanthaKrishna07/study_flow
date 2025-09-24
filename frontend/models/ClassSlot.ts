import mongoose, { Schema, Document } from "mongoose";

export interface IClassSlot extends Document {
  userId: string; // Reference to logged-in user
  subject: string;
  day: string; // e.g. Monday
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  room?: string;
  professor?: string;
}

const ClassSlotSchema = new Schema<IClassSlot>(
  {
    userId: { type: String, required: true },
    subject: { type: String, required: true },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String },
    professor: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ClassSlot ||
  mongoose.model<IClassSlot>("ClassSlot", ClassSlotSchema);
