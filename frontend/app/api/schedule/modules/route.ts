import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";
import Subject from "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function ensureAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
   
    const modules = await Module.find({ userId }).populate("subjectId").lean();
    return NextResponse.json(modules);
  } catch (err) {
    console.error("GET modules error:", err);
    return NextResponse.json({ message: "Error fetching modules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();

    
    const moduleData = {
      userId,
      name: body.name,
      subjectId: body.subjectId,
      difficulty: body.difficulty || "Medium",
      estimatedHours: body.estimatedHours || 2,
      completed: false,
      topics: Array.isArray(body.topics) ? body.topics.map((t: any) => ({
        title: t.title,
        priority: t.priority || "Medium",
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        completed: !!t.completed,
      })) : [],
    };

    const created = await Module.create(moduleData);

    
    const subjectModules = await Module.find({ subjectId: body.subjectId });
    const completedCount = subjectModules.filter((m) => m.completed).length;
    await Subject.findByIdAndUpdate(body.subjectId, {
      totalModules: subjectModules.length,
      completedModules: completedCount,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST module error:", err);
    return NextResponse.json({ message: "Error creating module" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();

    if (!body._id) {
      return NextResponse.json({ message: "Module _id required" }, { status: 400 });
    }

   
    const module = await Module.findOne({ _id: body._id, userId });
    if (!module) return NextResponse.json({ message: "Module not found" }, { status: 404 });

    let changed = false;

  
    if (body.updateModule && typeof body.updateModule === "object") {
      const up = body.updateModule;
      if (up.name !== undefined) module.name = up.name;
      if (up.difficulty !== undefined) module.difficulty = up.difficulty;
      if (up.estimatedHours !== undefined) module.estimatedHours = up.estimatedHours;
      changed = true;
    }

    
    if (typeof body.completed === "boolean") {
      module.completed = body.completed;
      changed = true;
    }


    if (body.newTopic && typeof body.newTopic === "object") {
      const nt = {
        title: body.newTopic.title,
        priority: body.newTopic.priority || "Medium",
        dueDate: body.newTopic.dueDate ? new Date(body.newTopic.dueDate) : undefined,
        completed: !!body.newTopic.completed,
      };
      module.topics.push(nt);
      changed = true;
    }

   
    if (body.topicId && body.topicUpdate) {
      const topic = module.topics.id(body.topicId);
      if (topic) {
        const tu = body.topicUpdate;
        if (tu.title !== undefined) topic.title = tu.title;
        if (tu.priority !== undefined) topic.priority = tu.priority;
        if (tu.dueDate !== undefined) topic.dueDate = tu.dueDate ? new Date(tu.dueDate) : undefined;
        if (typeof tu.completed === "boolean") topic.completed = tu.completed;
        changed = true;
      }
    }

    if (!changed) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
    }

    const saved = await module.save();


    const subjectModules = await Module.find({ subjectId: saved.subjectId });
    const completedCount = subjectModules.filter((m) => m.completed).length;
    await Subject.findByIdAndUpdate(saved.subjectId, {
      totalModules: subjectModules.length,
      completedModules: completedCount,
    });

   
    const populated = await Module.findById(saved._id).populate("subjectId").lean();
    return NextResponse.json(populated);
  } catch (err) {
    console.error("PUT module error:", err);
    return NextResponse.json({ message: "Error updating module" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const { _id } = await req.json();
    if (!_id) return NextResponse.json({ message: "Module _id required" }, { status: 400 });

    const deleted = await Module.findOneAndDelete({ _id, userId });
    if (!deleted) return NextResponse.json({ message: "Module not found" }, { status: 404 });

    
    const subjectModules = await Module.find({ subjectId: deleted.subjectId });
    const completedCount = subjectModules.filter((m) => m.completed).length;
    await Subject.findByIdAndUpdate(deleted.subjectId, {
      totalModules: subjectModules.length,
      completedModules: completedCount,
    });

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (err) {
    console.error("DELETE module error:", err);
    return NextResponse.json({ message: "Error deleting module" }, { status: 500 });
  }
}
