import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Task from "@/models/Task";
import Event from "@/models/Event";

export async function GET() {
  try {
    await dbConnect();

    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalEvents = await Event.countDocuments();
    const users = await User.find().select("-password");

    return NextResponse.json({
      stats: { totalUsers, totalTasks, totalEvents },
      users,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json(
      { message: "Error fetching admin stats" },
      { status: 500 }
    );
  }
}
