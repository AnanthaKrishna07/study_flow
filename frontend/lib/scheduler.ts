// lib/scheduler.ts
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Event from "@/models/Event";
import sendReminderMail from "@/lib/mailer";

/**
 * Scheduler for sending reminders 10 minutes before deadlines.
 * This runs on an interval (every 1 min by default).
 */

const CHECK_INTERVAL = 60 * 1000; // 1 minute
let isRunning = false;

export async function runReminderCheck() {
  if (isRunning) return; // prevent overlapping runs
  isRunning = true;

  try {
    await dbConnect();

    const now = new Date();
    const in10Min = new Date(now.getTime() + 10 * 60 * 1000);

    // Fetch due tasks (not already reminded)
    const tasks = await Task.find({
      reminderEnabled: true,
      reminderSent: { $ne: true },
      dueDate: { $gte: now, $lte: in10Min },
    });

    // Fetch due events (not already reminded)
    const events = await Event.find({
      reminderEnabled: true,
      reminderSent: { $ne: true },
      dateTime: { $gte: now, $lte: in10Min },
    });

    const reminders = [...tasks, ...events];
    if (reminders.length === 0) {
      console.log("⏳ No reminders due right now");
      isRunning = false;
      return;
    }

    for (const item of reminders) {
      const userEmail = (item as any).userEmail || (item as any).email; // ensure user email stored
      const title = (item as any).title || "Untitled";
      const due = (item as any).dueDate || (item as any).dateTime;

      if (!userEmail) {
        console.warn(`⚠️ No email found for reminder: ${title}`);
        continue;
      }

      await sendReminderMail(
        userEmail,
        `⏰ Reminder: ${title}`,
        `This is a reminder that your ${title} is scheduled at ${new Date(
          due
        ).toLocaleString()}.`,
        `
          <p>Hello,</p>
          <p>This is a reminder that your <b>${title}</b> is scheduled at:</p>
          <p><b>${new Date(due).toLocaleString()}</b></p>
          <p>Make sure you're prepared! 🚀</p>
        `
      );

      // Mark as reminded
      (item as any).reminderSent = true;
      await item.save();
    }

    console.log(`📧 Sent ${reminders.length} reminders`);
  } catch (err) {
    console.error("❌ Scheduler error:", err);
  } finally {
    isRunning = false;
  }
}

// Start background scheduler
export function startScheduler() {
  console.log("🕒 Reminder scheduler started...");
  setInterval(runReminderCheck, CHECK_INTERVAL);
}
