import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ✅ GET all subjects for logged-in user
export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const subjects = await Subject.find({ userId: (session.user as any).id });
    return NextResponse.json(subjects);
  } catch (err) {
    console.error("GET subjects error:", err);
    return NextResponse.json({ message: "Error fetching subjects" }, { status: 500 });
  }
}

// ✅ POST create a new subject
export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    const subject = await Subject.create({
      name: body.name,
      color: body.color || "#3B82F6",
      userId: (session.user as any).id,
      totalModules: 0,
      completedModules: 0,
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    console.error("POST subject error:", err);
    return NextResponse.json({ message: "Error creating subject" }, { status: 500 });
  }
}

// ✅ PUT update subject
export async function PUT(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    if (!body._id) {
      return NextResponse.json({ message: "Subject _id required" }, { status: 400 });
    }

    const subject = await Subject.findOneAndUpdate(
      { _id: body._id, userId: (session.user as any).id },
      body,
      { new: true }
    );

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (err) {
    console.error("PUT subject error:", err);
    return NextResponse.json({ message: "Error updating subject" }, { status: 500 });
  }
}

// ✅ DELETE subject
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { _id } = await req.json();

    if (!_id) {
      return NextResponse.json({ message: "Subject _id required" }, { status: 400 });
    }

    const subject = await Subject.findOneAndDelete({ _id, userId: (session.user as any).id });

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("DELETE subject error:", err);
    return NextResponse.json({ message: "Error deleting subject" }, { status: 500 });
  }
}
