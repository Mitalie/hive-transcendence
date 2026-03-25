import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ loggedIn: false });
    }

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: session.user.id,
        username: session.user.name ?? session.user.email ?? "User",
        email: session.user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ loggedIn: false }, { status: 500 });
  }
}
