import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      avatarData: true,
      avatarMime: true,
    },
  });

  if (user?.avatarData && user.avatarMime) {
    return new NextResponse(user.avatarData, {
      headers: {
        "Content-Type": user.avatarMime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return NextResponse.redirect(new URL("/images/user_icon.png", request.url), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
