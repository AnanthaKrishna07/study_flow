import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Event from "@/models/Event";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();
    const userId = (session.user as any).id;

    
    const [allTasks, allEvents] = await Promise.all([
      Task.find({ userId }).sort({ dueDate: 1 }).lean(),
      Event.find({ userId }).sort({ dateTime: 1 }).lean(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

   
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.completed).length;
    const todayTasks = allTasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) >= today &&
        new Date(t.dueDate) < tomorrow
    ).length;

   
    const upcomingEvents = allEvents.filter(
      (e) => e.dateTime && new Date(e.dateTime) >= today
    ).length;

    const stats = {
      totalTasks,
      completedTasks,
      todayTasks,
      upcomingEvents,
      completedModules: 0, 
      totalModules: 0,
    };

    return NextResponse.json({
      stats,
      upcomingTasks: allTasks.filter((t) => !t.completed).slice(0, 5),
      upcomingEventsList: allEvents.slice(0, 5),
    });
  } catch (error: any) {
    console.error("❌ Dashboard API error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
