import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs"; // ✅ Ensure Node.js runtime

const nodemailer = require("nodemailer");

export async function GET(req: Request) {
  try {
    // 🧩 Connect to MongoDB
    await dbConnect();

    // 🧠 Debug incoming secret header
    const internalSecret = req.headers.get("x-internal-secret");
    console.log("---- Reminder API Debug ----");
    console.log("Incoming x-internal-secret:", internalSecret);
    console.log("Expected REMINDER_SECRET:", process.env.REMINDER_SECRET);
    console.log("----------------------------");

    /* ✅ Allow internal scheduler access using secret header */
    if (internalSecret && internalSecret === process.env.REMINDER_SECRET) {
      console.log("✅ Internal scheduler access granted — sending reminders for all users");

      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

      // 🔍 Find all due, uncompleted, unreminded tasks
      const dueTasks = await Task.find({
        completed: false,
        reminderSent: { $ne: true },
        dueDate: { $lte: now, $gte: tenMinutesAgo },
      }).populate("userId");

      if (dueTasks.length === 0) {
        console.log("ℹ️ No tasks found for reminder window.");
        return NextResponse.json({ message: "No new reminders", count: 0 });
      }

      // ✉️ Setup Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // 📦 Group tasks by user email
      const tasksByUser: Record<string, any[]> = {};
      for (const task of dueTasks) {
        const user = task.userId;
        if (!user || !user.email) continue;
        const email = user.email.toString();
        if (!tasksByUser[email]) tasksByUser[email] = [];
        tasksByUser[email].push(task);
      }

      // 📧 Send emails per user
      for (const [email, userTasks] of Object.entries(tasksByUser)) {
        if (!Array.isArray(userTasks) || userTasks.length === 0) continue;

        const firstTask = userTasks[0] as any;
        const userName: string = firstTask?.userId?.name || "Student";

        const taskList = userTasks
          .map(
            (task: any) =>
              `• ${task.title} (Due: ${new Date(task.dueDate).toLocaleString()})`
          )
          .join("\n");

        const mailOptions = {
          from: `"StudyFlow Reminders" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "⏰ Task Reminder - StudyFlow",
          text: `Hello ${userName},\n\nThe following task(s) were due recently:\n\n${taskList}\n\nStay on track with StudyFlow!\n\n– StudyFlow Team`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`📨 Reminder email sent to ${email} (${userTasks.length} tasks)`);
        } catch (err) {
          console.error(`❌ Failed to send email to ${email}:`, err);
        }
      }

      // ✅ Mark all tasks as reminded
      await Task.updateMany(
        { _id: { $in: dueTasks.map((t: any) => t._id) } },
        { $set: { reminderSent: true, reminderSentAt: new Date() } }
      );

      return NextResponse.json({
        message: "Internal reminders sent successfully",
        count: dueTasks.length,
      });
    }

    /* 🔒 Regular user-triggered reminder (requires login) */
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      console.warn("⚠️ Unauthorized access attempt (no session)");
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user || !user.email) {
      return NextResponse.json({ message: "User email not found" }, { status: 400 });
    }

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // 🔍 Find this user's due, uncompleted, unreminded tasks
    const dueTasks = await Task.find({
      userId,
      completed: false,
      reminderSent: { $ne: true },
      dueDate: { $lte: now, $gte: tenMinutesAgo },
    });

    if (dueTasks.length === 0) {
      return NextResponse.json({ message: "No new reminders", count: 0 });
    }

    // ✉️ Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const taskList = dueTasks
      .map(
        (task: any) =>
          `• ${task.title} (Due: ${new Date(task.dueDate).toLocaleString()})`
      )
      .join("\n");

    const mailOptions = {
      from: `"StudyFlow Reminders" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "⏰ Task Reminder - StudyFlow",
      text: `Hello ${user.name || "Student"},\n\nThe following task(s) were due recently:\n\n${taskList}\n\nStay on track with StudyFlow!\n\n– StudyFlow Team`,
    };

    await transporter.sendMail(mailOptions);

    await Task.updateMany(
      { _id: { $in: dueTasks.map((t: any) => t._id) } },
      { $set: { reminderSent: true, reminderSentAt: new Date() } }
    );

    return NextResponse.json({
      message: "Reminders sent successfully",
      count: dueTasks.length,
    });
  } catch (err: any) {
    console.error("❌ Reminder API error:", err);
    return NextResponse.json(
      { message: "Error sending reminders", error: err.message },
      { status: 500 }
    );
  }
}
