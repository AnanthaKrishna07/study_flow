import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Module from "@/models/Module";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function ensureAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) return null;
  return session;
}

async function recalcSubjectProgress(subjectId: any) {
  const subjectModules = await Module.find({ subjectId }).lean();
  const totalModules = subjectModules.length;
  const completedModules = subjectModules.filter((m) => m.completed).length;
  await Subject.findByIdAndUpdate(subjectId, { totalModules, completedModules });
}


export async function GET() {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    
    const subjects = await Subject.find({ userId }).lean();
    for (const s of subjects) {
      if (s._id) await recalcSubjectProgress(s._id);
    }
    const updated = await Subject.find({ userId }).lean();
    return NextResponse.json(updated);
  } catch (err) {
    console.error("GET subjects error:", err);
    return NextResponse.json({ message: "Error fetching subjects" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();

    const subject = await Subject.create({
      name: body.name,
      color: body.color || "#3B82F6",
      userId,
      totalModules: 0,
      completedModules: 0,
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    console.error("POST subject error:", err);
    return NextResponse.json({ message: "Error creating subject" }, { status: 500 });
  }
}


export async function PUT(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    if (!body._id) return NextResponse.json({ message: "Subject _id required" }, { status: 400 });

    const subject = await Subject.findOneAndUpdate(
      { _id: body._id, userId },
      { name: body.name, color: body.color },
      { new: true }
    );

    if (!subject) return NextResponse.json({ message: "Subject not found" }, { status: 404 });

    await recalcSubjectProgress(subject._id);
    return NextResponse.json(subject);
  } catch (err) {
    console.error("PUT subject error:", err);
    return NextResponse.json({ message: "Error updating subject" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const { _id } = await req.json();
    if (!_id) return NextResponse.json({ message: "Subject _id required" }, { status: 400 });

    const subject = await Subject.findOneAndDelete({ _id, userId });
    if (!subject) return NextResponse.json({ message: "Subject not found" }, { status: 404 });

    
    await Module.deleteMany({ subjectId: _id });

    return NextResponse.json({ message: "Subject and related modules deleted successfully" });
  } catch (err) {
    console.error("DELETE subject error:", err);
    return NextResponse.json({ message: "Error deleting subject" }, { status: 500 });
  }
}
