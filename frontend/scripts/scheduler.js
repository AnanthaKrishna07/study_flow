require("dotenv").config();
const cron = require("node-cron");

// ✅ Use global fetch (Node 18+)
const fetchFn = global.fetch || fetch;

const REMINDER_URL =
  process.env.REMINDER_URL || "http://localhost:3000/api/tasks/reminders";
const SECRET = process.env.REMINDER_SECRET || "";

// 🧩 Debug print to verify environment variables
console.log("Loaded REMINDER_URL:", REMINDER_URL);
console.log("Loaded REMINDER_SECRET:", SECRET ? "(loaded successfully)" : "(MISSING!)");

/**
 * 📨 Calls the StudyFlow reminders API endpoint
 */
async function callReminders() {
  try {
    console.log(new Date().toISOString(), "— calling reminders endpoint");

    const res = await fetchFn(REMINDER_URL, {
      method: "GET",
      headers: {
        "x-internal-secret": SECRET,
        "Content-Type": "application/json",
      },
    });

    // Try to read response safely
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: "Invalid JSON response", raw: text };
    }

    console.log("Reminders response:", data);
  } catch (err) {
    console.error("❌ Error calling reminders API:", err);
  }
}

/**
 * ⏱ Schedule the reminders to run every 10 minutes
 */
cron.schedule("*/10 * * * *", () => {
  console.log("⏰ Running scheduled reminder check...");
  callReminders();
});

/**
 * 🚀 Run immediately once on startup
 */
callReminders();

console.log("✅ Scheduler started — calling", REMINDER_URL, "every 10 minutes");
