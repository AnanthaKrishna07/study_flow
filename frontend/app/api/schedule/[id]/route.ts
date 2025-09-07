import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const subject = await Subject.findOne({
      _id: params.id,
      userId: (session.user as any).id,
    });

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (err) {
    console.error("GET subject error:", err);
    return NextResponse.json({ message: "Error fetching subject" }, { status: 500 });
  }
}


export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
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

    return NextResponse.json(subject);
  } catch (err) {
    console.error("PUT subject error:", err);
    return NextResponse.json({ message: "Error updating subject" }, { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const deleted = await Subject.findOneAndDelete({
      _id: params.id,
      userId: (session.user as any).id,
    });

    if (!deleted) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("DELETE subject error:", err);
    return NextResponse.json({ message: "Error deleting subject" }, { status: 500 });
  }
}
