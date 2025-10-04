import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  userId: mongoose.Types.ObjectId;

  // 🔹 Extra analytics fields
  priority?: "High" | "Medium" | "Low";
  type?: "Homework" | "Assignment" | "Project" | "Reading" | "Other";
  completedAt?: Date; // timestamp when task was completed

  // 🔔 Reminder fields
  reminderSent?: boolean;
  reminderSentAt?: Date;

  // ⏱️ Auto timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema: Schema<ITask> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Analytics fields
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    type: {
      type: String,
      enum: ["Homework", "Assignment", "Project", "Reading", "Other"],
      default: "Other",
    },
    completedAt: { type: Date },

    // 🔔 Reminder fields
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: { type: Date },
  },
  { timestamps: true }
);

// 🔹 Middleware: auto-set completedAt when completed = true
TaskSchema.pre("save", function (next) {
  if (this.isModified("completed")) {
    if (this.completed && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (!this.completed) {
      this.completedAt = undefined; // reset if marked incomplete
    }
  }
  next();
});

// 🔹 Indexes for performance
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ reminderSent: 1, dueDate: 1 });

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
