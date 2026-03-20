// src/app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: session.user });
}