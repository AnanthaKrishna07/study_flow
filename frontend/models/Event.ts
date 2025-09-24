import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  dateTime: Date; // ✅ single field for both date & time
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
    dateTime: { type: Date, required: true }, // ✅ replaced date + time with one field
    type: {
      type: String,
      enum: ["Exam", "Meeting", "Placement", "Deadline", "Other"], // ✅ fixed enum
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

// ✅ Prevent model overwrite in dev (Hot Reload issue)
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
