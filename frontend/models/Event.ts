import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  date: Date;
  time: string;
  type: "Exam" | "Meeting" | "Placement" | "Deadline" | "Other";
  location?: string;
  meetLink?: string;
  reminderEnabled: boolean;
  userId: mongoose.Types.ObjectId;
}

const EventSchema: Schema<IEvent> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    time: { type: String, default: "09:00" },
    type: {
      type: String,
      enum: ["Exam", "Meeting", "Placement", "Deadline", "Other"],
      default: "Exam",
    },
    location: { type: String, trim: true },
    meetLink: { type: String, trim: true },
    reminderEnabled: { type: Boolean, default: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
