import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ClassSlot from "@/models/ClassSlot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function ensureAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) return null;
  return session;
}

// UPDATE a class
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();

    const updated = await ClassSlot.findOneAndUpdate(
      { _id: params.id, userId },
      body,
      { new: true }
    );

    if (!updated) return NextResponse.json({ message: "Class not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT timetable error:", err);
    return NextResponse.json({ message: "Error updating class" }, { status: 500 });
  }
}

// DELETE a class
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;

    const deleted = await ClassSlot.findOneAndDelete({ _id: params.id, userId });
    if (!deleted) return NextResponse.json({ message: "Class not found" }, { status: 404 });

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error("DELETE timetable error:", err);
    return NextResponse.json({ message: "Error deleting class" }, { status: 500 });
  }
}
