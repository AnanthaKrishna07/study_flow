// app/api/events/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function ensureAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) return null;
  return session;
}

/**
 * GET - List events for the user (optional ?upcoming=true&from&to)
 */
export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const url = new URL(req.url);
    const search = url.searchParams;
    const upcoming = search.get("upcoming");
    const from = search.get("from");
    const to = search.get("to");

    const query: any = { userId };

    if (upcoming === "true") {
      query.dateTime = { $gte: new Date() };
    }

    if (from || to) {
      query.dateTime = query.dateTime || {};
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        query.dateTime.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.dateTime.$lte = toDate;
      }
    }

    const events = await Event.find(query).sort({ dateTime: 1 }).lean();
    return NextResponse.json(events);
  } catch (err) {
    console.error("❌ GET events error:", err);
    return NextResponse.json({ message: "Error fetching events" }, { status: 500 });
  }
}

/**
 * POST - create a new event
 */
export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    if (!body.title || !body.date) {
      return NextResponse.json({ message: "Title and date are required" }, { status: 400 });
    }

    const dateTime = new Date(body.time ? `${body.date}T${body.time}` : body.date);
    if (isNaN(dateTime.getTime())) {
      return NextResponse.json({ message: "Invalid date/time" }, { status: 400 });
    }

    const evt = await Event.create({
      userId,
      title: body.title,
      description: body.description || "",
      dateTime,
      time: body.time || "", // explicitly store `time`
      type: body.type || "Other",
      location: body.location || "",
      meetLink: body.meetLink || "",
      reminderEnabled: !!body.reminderEnabled,
    });

    return NextResponse.json(evt, { status: 201 });
  } catch (err) {
    console.error("❌ POST events error:", err);
    return NextResponse.json({ message: "Error creating event" }, { status: 500 });
  }
}

/**
 * PUT - update event
 */
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
      return NextResponse.json({ message: "Event _id required" }, { status: 400 });
    }

    const existing = await Event.findOne({ _id: body._id, userId });
    if (!existing) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const update: any = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.type !== undefined) update.type = body.type;
    if (body.location !== undefined) update.location = body.location;
    if (body.meetLink !== undefined) update.meetLink = body.meetLink;
    if (typeof body.reminderEnabled === "boolean") update.reminderEnabled = body.reminderEnabled;

    // handle date/time updates
    let baseDate = existing.dateTime ? new Date(existing.dateTime) : new Date();
    if (body.date) {
      const tmp = new Date(body.date);
      tmp.setHours(baseDate.getHours(), baseDate.getMinutes());
      baseDate = tmp;
    }
    if (body.time) {
      const [hh, mm] = (body.time || "").split(":").map((x: string) => parseInt(x, 10));
      if (!isNaN(hh) && !isNaN(mm)) {
        baseDate.setHours(hh, mm, 0, 0);
      }
    }

    if (body.date || body.time) {
      update.dateTime = baseDate;
      update.time = body.time ?? (existing as any).time ?? "";
    }

    const updated = await Event.findOneAndUpdate({ _id: body._id, userId }, update, { new: true });
    return updated
      ? NextResponse.json(updated)
      : NextResponse.json({ message: "Event not found" }, { status: 404 });
  } catch (err) {
    console.error("❌ PUT events error:", err);
    return NextResponse.json({ message: "Error updating event" }, { status: 500 });
  }
}

/**
 * DELETE - delete event
 */
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    if (!body._id) {
      return NextResponse.json({ message: "Event _id required" }, { status: 400 });
    }

    const deleted = await Event.findOneAndDelete({ _id: body._id, userId });
    return deleted
      ? NextResponse.json({ message: "Event deleted successfully" })
      : NextResponse.json({ message: "Event not found" }, { status: 404 });
  } catch (err) {
    console.error("❌ DELETE events error:", err);
    return NextResponse.json({ message: "Error deleting event" }, { status: 500 });
  }
}
