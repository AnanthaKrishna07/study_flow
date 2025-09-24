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

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const url = new URL(req.url);
    const search = url.searchParams;
    const upcoming = search.get("upcoming");
    const from = search.get("from");
    const to = search.get("to");

    const query: any = { userId };

    // If client asks for upcoming events
    if (upcoming === "true") {
      query.dateTime = { $gte: new Date() };
    }

    // Range filter (from / to)
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

    // Try to return events sorted by dateTime (if exists)
    // If your model uses `date` instead of `dateTime` adjust accordingly.
    const events = await Event.find(query).sort({ dateTime: 1 }).lean();
    return NextResponse.json(events);
  } catch (err) {
    console.error("GET events error:", err);
    return NextResponse.json({ message: "Error fetching events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    // Build dateTime from possible inputs
    let dateTime: Date | null = null;
    if (body.dateTime) {
      dateTime = new Date(body.dateTime);
    } else if (body.date && body.time) {
      dateTime = new Date(`${body.date}T${body.time}`);
    } else if (body.date) {
      const d = new Date(body.date);
      d.setHours(0, 0, 0, 0);
      dateTime = d;
    } else {
      return NextResponse.json({ message: "date or dateTime (and optionally time) required" }, { status: 400 });
    }

    if (!dateTime || isNaN(dateTime.getTime())) {
      return NextResponse.json({ message: "Invalid date/time provided" }, { status: 400 });
    }

    const evt = await Event.create({
      userId,
      title: body.title,
      description: body.description || "",
      dateTime, // store unified dateTime field
      time: body.time || undefined,
      type: body.type || "Other",
      location: body.location || "",
      meetLink: body.meetLink || "",
      reminderEnabled: !!body.reminderEnabled,
    });

    return NextResponse.json(evt, { status: 201 });
  } catch (err) {
    console.error("POST events error:", err);
    return NextResponse.json({ message: "Error creating event" }, { status: 500 });
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
      return NextResponse.json({ message: "Event _id required" }, { status: 400 });
    }

    const update: any = {};

    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.type !== undefined) update.type = body.type;
    if (body.location !== undefined) update.location = body.location;
    if (body.meetLink !== undefined) update.meetLink = body.meetLink;
    if (typeof body.reminderEnabled === "boolean") update.reminderEnabled = body.reminderEnabled;
    if (body.time !== undefined) update.time = body.time;

    // If client sends explicit dateTime
    if (body.dateTime) {
      const dt = new Date(body.dateTime);
      if (isNaN(dt.getTime())) return NextResponse.json({ message: "Invalid dateTime" }, { status: 400 });
      update.dateTime = dt;
    } else if (body.date || body.time) {
      // If partially updating date/time we need to fetch existing event first
      const existing = await Event.findOne({ _id: body._id, userId });
      if (!existing) return NextResponse.json({ message: "Event not found" }, { status: 404 });

      // baseDate can be stored as `dateTime` or `date` in older data — support both
      let baseDate: Date | null = null;
      if (existing.dateTime) baseDate = new Date(existing.dateTime);
      else if ((existing as any).date) baseDate = new Date((existing as any).date);
      else baseDate = new Date(); // fallback

      // ensure it's a valid Date object
      baseDate = new Date(baseDate);
      if (isNaN(baseDate.getTime())) baseDate = new Date();

      // If `date` provided, replace Y-M-D but keep time portion from baseDate (or set to 00:00 if not present)
      if (body.date) {
        const tmp = new Date(body.date);
        tmp.setHours(baseDate.getHours(), baseDate.getMinutes(), baseDate.getSeconds(), baseDate.getMilliseconds());
        baseDate = tmp;
      }

      // If `time` provided set HH:MM of baseDate
      if (body.time) {
        const [hhRaw, mmRaw] = (body.time || "").split(":").map((x: string) => parseInt(x, 10));
        const hh = Number.isFinite(hhRaw) ? hhRaw : NaN;
        const mm = Number.isFinite(mmRaw) ? mmRaw : NaN;
        if (!isNaN(hh) && !isNaN(mm)) {
          baseDate.setHours(hh, mm, 0, 0);
        }
      }

      update.dateTime = baseDate;
    }

    const updated = await Event.findOneAndUpdate({ _id: body._id, userId }, update, { new: true });
    if (!updated) return NextResponse.json({ message: "Event not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT events error:", err);
    return NextResponse.json({ message: "Error updating event" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const session = await ensureAuth();
    if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const _id = body._id;

    if (!_id) return NextResponse.json({ message: "Event _id required" }, { status: 400 });

    const deleted = await Event.findOneAndDelete({ _id, userId });
    if (!deleted) return NextResponse.json({ message: "Event not found" }, { status: 404 });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("DELETE events error:", err);
    return NextResponse.json({ message: "Error deleting event" }, { status: 500 });
  }
}
