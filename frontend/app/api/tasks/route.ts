import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const tasks = await Task.find({ userId: (session.user as any).id }).sort({
      dueDate: 1,
    });
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET tasks error:", err);
    return NextResponse.json(
      { message: "Error fetching tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    const task = await Task.create({
      userId: (session.user as any).id,
      title: body.title,
      subject: body.subject || "",
      description: body.description || "",
      dueDate: body.dueDate,
      priority: body.priority || "Medium",
      type: body.type || "Other",
      completed: false,
      completedAt: null,

      // 🔔 Reminder defaults
      reminderSent: false,
      reminderSentAt: null,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("POST task error:", err);
    return NextResponse.json(
      { message: "Error creating task" },
      { status: 500 }
    );
  }
}
