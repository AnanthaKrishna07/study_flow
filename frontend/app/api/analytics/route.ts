import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Module from "@/models/Module";
import Subject from "@/models/Subject";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    const [tasks, modules, subjects] = await Promise.all([
      Task.find({ userId }).lean(),
      Module.find({ userId }).lean(),
      Subject.find({ userId }).lean(),
    ]);

    // --- Task Stats
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      overdue: tasks.filter(
        (t) => !t.completed && new Date(t.dueDate) < new Date()
      ).length,
      completionRate:
        tasks.length > 0 ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0,
    };

    // --- Module Stats
    const moduleStats = {
      total: modules.length,
      completed: modules.filter((m) => m.completed).length,
      completionRate:
        modules.length > 0
          ? Math.round((modules.filter((m) => m.completed).length / modules.length) * 100)
          : 0,
    };

    // --- Pie Data
    const taskStatus = [
      { name: "Completed", value: taskStats.completed, color: "#10B981" },
      { name: "Pending", value: taskStats.total - taskStats.completed, color: "#EF4444" },
    ];

    const priorityDist = ["High", "Medium", "Low"].map((p, i) => ({
      name: p,
      value: tasks.filter((t) => t.priority === p).length,
      color: ["#EF4444", "#F59E0B", "#10B981"][i],
    })).filter((d) => d.value > 0);

    const taskTypeDist = ["Homework", "Assignment", "Project", "Reading", "Other"].map((type, i) => ({
      name: type,
      value: tasks.filter((t) => t.type === type).length,
      color: ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#6B7280"][i],
    })).filter((d) => d.value > 0);

    const difficultyDist = ["Easy", "Medium", "Hard"].map((level, i) => ({
      name: level,
      value: modules.filter((m) => m.difficulty === level).length,
      color: ["#10B981", "#F59E0B", "#EF4444"][i],
    })).filter((d) => d.value > 0);

    // --- Subject Progress
    const subjectAllocation = subjects.map((s) => {
      const subjectModules = modules.filter((m) => m.subjectId.toString() === s._id.toString());
      return {
        name: s.name,
        totalModules: subjectModules.length,
        completedModules: subjectModules.filter((m) => m.completed).length,
      };
    });

    // --- Study Time (dummy example)
    const studyTimeDist = [
      { name: "Morning", value: 10, color: "#3B82F6" },
      { name: "Afternoon", value: 15, color: "#F59E0B" },
      { name: "Evening", value: 20, color: "#10B981" },
    ];

    // --- Weekly Trend
    const weeklyTrend: any[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      weeklyTrend.push({
        week: `W${6 - i}`,
        completedTasks: tasks.filter(
          (t) => t.completed && new Date(t.updatedAt) >= weekStart && new Date(t.updatedAt) < weekEnd
        ).length,
        completedModules: modules.filter(
          (m) => m.completed && new Date(m.updatedAt) >= weekStart && new Date(m.updatedAt) < weekEnd
        ).length,
      });
    }

    return NextResponse.json({
      taskStats,
      moduleStats,
      taskStatus,
      priorityDist,
      taskTypeDist,
      difficultyDist,
      subjectAllocation,
      studyTimeDist,
      weeklyTrend,
    });
  } catch (err: any) {
    console.error("Analytics API error:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}
