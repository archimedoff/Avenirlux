import { NextResponse } from "next/server";

import { userRepository } from "@/lib/db/repositories/user-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";

    if (!email.includes("@") || password.length < 8 || !firstName || !lastName) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await userRepository.create({ email, password, firstName, lastName });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
