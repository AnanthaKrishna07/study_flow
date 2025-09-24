import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";
import Subject from "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

async function ensureAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) return null;
  return session;
}

async function recalcSubjectProgress(subjectId: mongoose.Types.ObjectId | string) {

  const subjectModules = await Module.find({ subjectId }).lean();
  const totalModules = subjectModules.length;
  const completedModules = subjectModules.filter((m) => m.completed).length;
  await Subject.findByIdAndUpdate(subjectId, { totalModules, completedModules });
}

export async function GET() {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

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
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

 
    if (!body.name || !body.subjectId) {
      return NextResponse.json({ message: "name and subjectId are required" }, { status: 400 });
    }

    const estimatedHours = Number(body.estimatedHours) || 1;

    const moduleData = {
      userId,
      subjectId: body.subjectId,
      name: body.name,
      difficulty: body.difficulty || "Medium",
      estimatedHours,
      completed: !!body.completed,
      topics: Array.isArray(body.topics)
        ? body.topics.map((t: any) => ({
            title: t.title,
            priority: t.priority || "Medium",
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
            completed: !!t.completed,
          }))
        : [],
    };

    const created = await Module.create(moduleData);

   
    await recalcSubjectProgress(body.subjectId);

   
    const populated = await Module.findById(created._id).populate("subjectId").lean();
    return NextResponse.json(populated, { status: 201 });
  } catch (err) {
    console.error("POST module error:", err);
    return NextResponse.json({ message: "Error creating module" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    if (!body._id) {
      return NextResponse.json({ message: "Module _id required" }, { status: 400 });
    }

   
    const module = await Module.findOne({ _id: body._id, userId });
    if (!module) {
      return NextResponse.json({ message: "Module not found" }, { status: 404 });
    }

    let changed = false;

  
    if (body.updateModule && typeof body.updateModule === "object") {
      const up = body.updateModule;
      if (up.name !== undefined) {
        module.name = up.name;
        changed = true;
      }
      if (up.difficulty !== undefined) {
        module.difficulty = up.difficulty;
        changed = true;
      }
      if (up.estimatedHours !== undefined) {
        module.estimatedHours = Number(up.estimatedHours) || module.estimatedHours;
        changed = true;
      }
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
      module.topics.push(nt as any);
      changed = true;
    }

   
    if (body.topicId && body.topicUpdate) {
      const topicIdStr = String(body.topicId);
      
      const topic = module.topics.find((t: any) => {
       
        if (!t) return false;
        return String((t as any)._id) === topicIdStr;
      });

      if (topic) {
        const tu = body.topicUpdate;
        if (tu.title !== undefined) topic.title = tu.title;
        if (tu.priority !== undefined) topic.priority = tu.priority;
        if (tu.dueDate !== undefined) topic.dueDate = tu.dueDate ? new Date(tu.dueDate) : undefined;
        if (typeof tu.completed === "boolean") topic.completed = tu.completed;
        changed = true;
      } else {
        
        return NextResponse.json({ message: "Topic not found in module" }, { status: 404 });
      }
    }

    if (!changed) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
    }

  
    await module.save();

   
    await recalcSubjectProgress(module.subjectId);

   
    const populated = await Module.findById(module._id).populate("subjectId").lean();
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
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { _id } = await req.json();

    if (!_id) {
      return NextResponse.json({ message: "Module _id required" }, { status: 400 });
    }

    const deleted = await Module.findOneAndDelete({ _id, userId });
    if (!deleted) {
      return NextResponse.json({ message: "Module not found" }, { status: 404 });
    }

   
    await recalcSubjectProgress(deleted.subjectId);

    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (err) {
    console.error("DELETE module error:", err);
    return NextResponse.json({ message: "Error deleting module" }, { status: 500 });
  }
}
