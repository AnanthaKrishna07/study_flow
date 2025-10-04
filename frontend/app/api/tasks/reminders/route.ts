import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export const runtime = "nodejs";


const nodemailer = require("nodemailer");

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user || !user.email) {
      return NextResponse.json(
        { message: "User email not found" },
        { status: 400 }
      );
    }

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // 🔍 Find tasks due in the last 10 minutes that are not completed & not reminded
    const dueTasks = await Task.find({
      userId,
      completed: false,
      reminderSent: { $ne: true },
      dueDate: { $lte: now, $gte: tenMinutesAgo },
    });

    if (dueTasks.length === 0) {
      return NextResponse.json({ message: "No new reminders", count: 0 });
    }

    // ✉️ Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or SMTP { host, port, secure, auth }
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Build email content
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
      text: `Hello ${user.name || "Student"},\n\nThe following tasks were due recently:\n\n${taskList}\n\nStay on track with StudyFlow!\n\n- StudyFlow`,
    };

    // 🚀 Send email
    await transporter.sendMail(mailOptions);

    // ✅ Mark tasks as reminded
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
