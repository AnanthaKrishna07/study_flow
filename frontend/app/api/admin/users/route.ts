import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// ✅ Get All Users (extra safety, but mainly done in stats)
export async function GET() {
  try {
    await dbConnect();
    const users = await User.find().select("-password");
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get Users Error:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

// ✅ Create New User
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // default role
    });

    return NextResponse.json(
      { message: "User created successfully", user: { ...newUser.toObject(), password: undefined } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create User Error:", error);
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }
}
