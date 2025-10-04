import mongoose, { Schema, Document } from "mongoose";

export interface IClassSlot extends Document {
  userId: string;       // Reference to logged-in user
  subject: string;      // Subject name or ID
  day: string;          // e.g. "Monday"
  startTime: string;    // "HH:MM" (24h format)
  endTime: string;      // "HH:MM" (24h format)
  room?: string;
  professor?: string;
  duration?: number;    // computed in minutes or hours
  attended?: boolean;   // whether student actually attended/studied
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
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },   // "HH:MM"
    room: { type: String },
    professor: { type: String },

    // 🔹 New fields for analytics
    duration: { type: Number, default: 1 },   // duration in hours (or minutes if you prefer)
    attended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔹 Middleware: auto-calculate duration if not provided
ClassSlotSchema.pre("save", function (next) {
  if (!this.duration && this.startTime && this.endTime) {
    const [sh, sm] = this.startTime.split(":").map(Number);
    const [eh, em] = this.endTime.split(":").map(Number);
    if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      let diff = endMinutes - startMinutes;
      if (diff < 0) diff += 24 * 60; // handle overnight case
      this.duration = Math.round(diff / 60); // store in hours (rounded)
    }
  }
  next();
});

export default mongoose.models.ClassSlot ||
  mongoose.model<IClassSlot>("ClassSlot", ClassSlotSchema);
