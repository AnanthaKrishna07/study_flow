// app/api/reminders/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Event from "@/models/Event";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sendReminderMail from "@/lib/mailer"; // ✅ fixed import

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = (session.user as any).email;

    if (!userEmail) {
      return NextResponse.json({ message: "User email not found" }, { status: 400 });
    }

    const now = new Date();
    const in10Min = new Date(now.getTime() + 10 * 60 * 1000);

    // Find tasks due within next 10 minutes
    const tasks = await Task.find({
      userId,
      reminderEnabled: true,
      reminderSent: { $ne: true },
      dueDate: { $gte: now, $lte: in10Min },
    });

    // Find events due within next 10 minutes
    const events = await Event.find({
      userId,
      reminderEnabled: true,
      reminderSent: { $ne: true },
      dateTime: { $gte: now, $lte: in10Min },
    });

    const reminders = [...tasks, ...events];
    if (reminders.length === 0) {
      return NextResponse.json({ message: "No reminders due right now" });
    }

    // Send reminder emails
    for (const item of reminders) {
      const title = (item as any).title || "Untitled";
      const due = (item as any).dueDate || (item as any).dateTime;

      await sendReminderMail( // ✅ updated function name
        userEmail,
        `⏰ Reminder: ${title}`,
        `This is a reminder that your ${title} is scheduled at ${new Date(due).toLocaleString()}.`,
        `
          <p>Hello,</p>
          <p>This is a reminder that your <b>${title}</b> is scheduled at:</p>
          <p><b>${new Date(due).toLocaleString()}</b></p>
          <p>Make sure you're prepared! 🚀</p>
        `
      );

      // Mark reminder as sent to avoid duplicates
      (item as any).reminderSent = true;
      await item.save();
    }

    return NextResponse.json({
      message: "Reminders sent",
      count: reminders.length,
    });
  } catch (err) {
    console.error("❌ Reminder error:", err);
    return NextResponse.json({ message: "Error sending reminders" }, { status: 500 });
  }
}
