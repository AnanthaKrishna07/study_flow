import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";
import Subject from "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const modules = await Module.find({ userId: (session.user as any).id }).populate("subjectId");
    return NextResponse.json(modules);
  } catch (err) {
    console.error("GET modules error:", err);
    return NextResponse.json({ message: "Error fetching modules" }, { status: 500 });
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

    const module = await Module.create({
      userId: (session.user as any).id,
      name: body.name,
      subjectId: body.subjectId,
      difficulty: body.difficulty || "Medium",
      estimatedHours: body.estimatedHours || 2,
      completed: false,
    });

   
    await Subject.findByIdAndUpdate(body.subjectId, { $inc: { totalModules: 1 } });

    return NextResponse.json(module, { status: 201 });
  } catch (err) {
    console.error("POST module error:", err);
    return NextResponse.json({ message: "Error creating module" }, { status: 500 });
  }
}


export async function PUT(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    if (!body._id) {
      return NextResponse.json({ message: "Module _id required" }, { status: 400 });
    }

    const module = await Module.findOneAndUpdate(
      { _id: body._id, userId: (session.user as any).id },
      body,
      { new: true }
    );

    if (!module) return NextResponse.json({ message: "Module not found" }, { status: 404 });

    
    if (typeof body.completed === "boolean") {
      const subjectModules = await Module.find({ subjectId: module.subjectId });
      const completedCount = subjectModules.filter((m) => m.completed).length;
      await Subject.findByIdAndUpdate(module.subjectId, { completedModules: completedCount });
    }

    return NextResponse.json(module);
  } catch (err) {
    console.error("PUT module error:", err);
    return NextResponse.json({ message: "Error updating module" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { _id } = await req.json();

    if (!_id) {
      return NextResponse.json({ message: "Module _id required" }, { status: 400 });
    }

    const module = await Module.findOneAndDelete({ _id, userId: (session.user as any).id });
    if (!module) return NextResponse.json({ message: "Module not found" }, { status: 404 });

    // ✅ update subject counts
    await Subject.findByIdAndUpdate(module.subjectId, { $inc: { totalModules: -1 } });

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (err) {
    console.error("DELETE module error:", err);
    return NextResponse.json({ message: "Error deleting module" }, { status: 500 });
  }
}
