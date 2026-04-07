import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { setUserPassword } from "@/data/user";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { password } = await req.json();
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  await setUserPassword(session.user.email, password);

  return NextResponse.json({ ok: true });
}
