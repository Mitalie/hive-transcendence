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
      avatarUrl: true,
      image: true,
    },
  });

  if (!user) {
    const response = NextResponse.redirect(
      new URL("/images/user_icon.png", request.url),
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (user.avatarData && user.avatarMime) {
    return new NextResponse(user.avatarData, {
      headers: {
        "Content-Type": user.avatarMime,
        "Cache-Control": "no-store",
      },
    });
  }

  if (user.avatarUrl) {
    const response = NextResponse.redirect(user.avatarUrl);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (user.image) {
    const response = NextResponse.redirect(user.image);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const response = NextResponse.redirect(
    new URL("/images/user_icon.png", request.url),
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
