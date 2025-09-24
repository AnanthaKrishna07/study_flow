import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Module from "@/models/Module";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// helper: ensure authentication
async function ensureAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) return null;
  return session;
}

// helper: recalc subject progress
async function recalcSubjectProgress(subjectId: string) {
  const subjectModules = await Module.find({ subjectId }).lean();
  const totalModules = subjectModules.length;
  const completedModules = subjectModules.filter((m) => m.completed).length;

  await Subject.findByIdAndUpdate(subjectId, { totalModules, completedModules });
}

// ✅ GET subject with its modules + topics
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const subject = await Subject.findOne({
      _id: params.id,
      userId,
    }).lean();

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    const modules = await Module.find({ subjectId: params.id, userId }).lean();

    return NextResponse.json({
      ...subject,
      modules,
    });
  } catch (err) {
    console.error("GET subject error:", err);
    return NextResponse.json({ message: "Error fetching subject" }, { status: 500 });
  }
}

// ✅ PUT update subject
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    const subject = await Subject.findOneAndUpdate(
      { _id: params.id, userId: (session.user as any).id },
      body,
      { new: true }
    );

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    await recalcSubjectProgress(params.id);

    return NextResponse.json(subject);
  } catch (err) {
    console.error("PUT subject error:", err);
    return NextResponse.json({ message: "Error updating subject" }, { status: 500 });
  }
}

// ✅ DELETE subject + its modules
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const deleted = await Subject.findOneAndDelete({
      _id: params.id,
      userId: (session.user as any).id,
    });

    if (!deleted) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    // also delete related modules
    await Module.deleteMany({ subjectId: params.id });

    return NextResponse.json({ message: "Subject and related modules deleted successfully" });
  } catch (err) {
    console.error("DELETE subject error:", err);
    return NextResponse.json({ message: "Error deleting subject" }, { status: 500 });
  }
}
