import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type Params = {
  params: { id: string };
};

export async function PUT(req: Request, { params }: Params) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    // 🔹 Handle completion timestamp
    if (typeof body.completed !== "undefined") {
      body.completedAt = body.completed ? new Date() : null;
    }

    // 🔹 Handle reminder timestamp
    if (typeof body.reminderSent !== "undefined") {
      body.reminderSentAt = body.reminderSent ? new Date() : null;
    }

    const updated = await Task.findOneAndUpdate(
      { _id: params.id, userId: (session.user as any).id },
      { $set: body },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT task error:", err);
    return NextResponse.json(
      { message: "Error updating task" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const deleted = await Task.findOneAndDelete({
      _id: params.id,
      userId: (session.user as any).id,
    });

    if (!deleted) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("DELETE task error:", err);
    return NextResponse.json(
      { message: "Error deleting task" },
      { status: 500 }
    );
  }
}
