import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Module from "@/models/Module";
import Subject from "@/models/Subject";
import ClassSlot from "@/models/ClassSlot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper: week number
function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(
    (((d.getTime() - yearStart.getTime()) / 86400000) + yearStart.getUTCDay() + 1) / 7
  );
}

// Helper: safe date conversion
function toDateSafe(value: any): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const tasks = await Task.find({ userId }).lean();
    const modules = await Module.find({ userId }).lean();
    const subjects = await Subject.find({ userId }).lean();
    const classSlots = await ClassSlot.find({ userId }).lean();

    /* ---------- Task Stats ---------- */
    const total = tasks.length;
    const completed = tasks.filter((t) => !!t.completed).length;
    const overdue = tasks.filter(
      (t) =>
        !t.completed &&
        t.dueDate &&
        toDateSafe(t.dueDate) &&
        toDateSafe(t.dueDate)! < new Date()
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const taskStats = { total, completed, overdue, completionRate };

    /* ---------- Module Stats ---------- */
    const modTotal = modules.length;
    const modCompleted = modules.filter((m) => !!m.completed).length;
    const moduleCompletionRate = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
    const moduleStats = { total: modTotal, completed: modCompleted, completionRate: moduleCompletionRate };

    /* ---------- Distributions ---------- */
    const taskStatus = [
      { name: "Completed", value: completed, color: "#10B981" },
      { name: "Pending", value: Math.max(0, total - completed), color: "#EF4444" },
    ];

    const priorityDist = ["High", "Medium", "Low"]
      .map((p, idx) => ({
        name: p,
        value: tasks.filter((t) => t.priority === p).length,
        color: ["#EF4444", "#F59E0B", "#10B981"][idx],
      }))
      .filter((d) => d.value > 0);

    const taskTypeDist = ["Homework", "Assignment", "Project", "Reading", "Other"]
      .map((type, idx) => ({
        name: type,
        value: tasks.filter((t) => t.type === type).length,
        color: ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#6B7280"][idx],
      }))
      .filter((d) => d.value > 0);

    const difficultyDist = ["Easy", "Medium", "Hard"]
      .map((d, idx) => ({
        name: d,
        value: modules.filter((m) => m.difficulty === d).length,
        color: ["#10B981", "#F59E0B", "#EF4444"][idx],
      }))
      .filter((d) => d.value > 0);

    /* ---------- Study Hours (Mon–Sun) ---------- */
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const studyHours = days.map((day) => {
      const planned = classSlots
        .filter((slot) => slot?.day?.startsWith(day))
        .reduce((sum, slot) => sum + (typeof slot?.duration === "number" ? slot.duration : 1), 0);

      const attendedDuration = classSlots
        .filter((slot) => slot?.day?.startsWith(day) && !!slot?.attended)
        .reduce((sum, slot) => sum + (typeof slot?.duration === "number" ? slot.duration : 1), 0);

      const tasksCompletedThatDay = tasks.filter((t) => {
        const dt = toDateSafe((t as any).completedAt ?? (t as any).updatedAt ?? (t as any).createdAt);
        if (!dt) return false;
        const wk = dt.toLocaleDateString("en-US", { weekday: "short" });
        return wk === day;
      }).length;

      return { day, planned, actual: attendedDuration + tasksCompletedThatDay };
    });

    /* ---------- Deadline Pressure ---------- */
    const now = new Date();
    const deadlinePressure = [
      {
        range: "Today",
        tasks: tasks.filter((t) => {
          const d = toDateSafe(t.dueDate);
          return d && d.toDateString() === now.toDateString();
        }).length,
      },
      {
        range: "Next 3 Days",
        tasks: tasks.filter((t) => {
          const d = toDateSafe(t.dueDate);
          return d && d >= now && d <= new Date(Date.now() + 3 * 86400000);
        }).length,
      },
      {
        range: "Next 7 Days",
        tasks: tasks.filter((t) => {
          const d = toDateSafe(t.dueDate);
          return d && d >= now && d <= new Date(Date.now() + 7 * 86400000);
        }).length,
      },
    ];

    /* ---------- Productivity by Time ---------- */
    const buckets: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    tasks.forEach((t) => {
      const dt = toDateSafe((t as any).completedAt ?? (t as any).updatedAt ?? (t as any).createdAt);
      if (!dt) return;
      const hour = dt.getHours();
      if (hour >= 6 && hour < 12) buckets.Morning++;
      else if (hour >= 12 && hour < 17) buckets.Afternoon++;
      else if (hour >= 17 && hour < 22) buckets.Evening++;
      else buckets.Night++;
    });

    classSlots.forEach((slot) => {
      const dt = toDateSafe(slot?.startTime);
      if (!dt) return;
      const hour = dt.getHours();
      if (hour >= 6 && hour < 12) buckets.Morning++;
      else if (hour >= 12 && hour < 17) buckets.Afternoon++;
      else if (hour >= 17 && hour < 22) buckets.Evening++;
      else buckets.Night++;
    });

    const studyScheduleProductivity = Object.entries(buckets).map(([time, sessions]) => ({ time, sessions }));

    /* ---------- Subject Allocation ---------- */
    const subjectAllocation = subjects.map((s) => {
      const subjectModules = modules.filter((m) => (m as any).subjectId?.toString() === (s as any)._id.toString());
      return {
        name: s.name || "Unnamed",
        completedModules: subjectModules.filter((m) => !!m.completed).length,
        totalModules: subjectModules.length,
      };
    });

    /* ---------- Weekly Trend ---------- */
    const weeklyMap: Record<string, { completedTasks: number; completedModules: number }> = {};

    tasks.forEach((t) => {
      if (t.completed) {
        const dt = toDateSafe((t as any).completedAt ?? (t as any).updatedAt ?? (t as any).createdAt);
        if (!dt) return;
        const week = `W${getWeekNumber(dt)}`;
        if (!weeklyMap[week]) weeklyMap[week] = { completedTasks: 0, completedModules: 0 };
        weeklyMap[week].completedTasks++;
      }
    });

    modules.forEach((m) => {
      if (m.completed) {
        const dt = toDateSafe((m as any).completedAt ?? (m as any).updatedAt ?? (m as any).createdAt);
        if (!dt) return;
        const week = `W${getWeekNumber(dt)}`;
        if (!weeklyMap[week]) weeklyMap[week] = { completedTasks: 0, completedModules: 0 };
        weeklyMap[week].completedModules++;
      }
    });

    const weeklyTrend = Object.entries(weeklyMap)
      .map(([week, val]) => ({ week, ...val }))
      .sort((a, b) => parseInt(a.week.slice(1)) - parseInt(b.week.slice(1)));

    return NextResponse.json({
      taskStats,
      moduleStats,
      taskStatus,
      priorityDist,
      taskTypeDist,
      difficultyDist,
      studyHours,
      deadlinePressure,
      studyScheduleProductivity,
      subjectAllocation,
      weeklyTrend,
    });
  } catch (err) {
    console.error("Analytics API error:", err);
    return NextResponse.json({ message: "Error fetching analytics" }, { status: 500 });
  }
}
