// app/api/test/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: "✅ MongoDB Connected Successfully!" });
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    return NextResponse.json({ message: "❌ Failed to connect MongoDB" }, { status: 500 });
  }
}
