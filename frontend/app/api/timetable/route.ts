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

// GET all classes of logged-in user
export async function GET() {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const classes = await ClassSlot.find({ userId }).lean();
    return NextResponse.json(classes);
  } catch (err) {
    console.error("GET timetable error:", err);
    return NextResponse.json({ message: "Error fetching classes" }, { status: 500 });
  }
}

// POST new class
export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();

    const newClass = await ClassSlot.create({
      userId,
      subject: body.subject,
      day: body.day,
      startTime: body.startTime,
      endTime: body.endTime,
      room: body.room,
      professor: body.professor,
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (err) {
    console.error("POST timetable error:", err);
    return NextResponse.json({ message: "Error creating class" }, { status: 500 });
  }
}
