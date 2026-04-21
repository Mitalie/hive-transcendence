import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateInitialAvatar(name: string): NextResponse {
  const initial = (name.trim().charAt(0) || "?").toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#349dff"/>
        <stop offset="100%" stop-color="#8037ff"/>
      </linearGradient>
    </defs>
    <circle cx="64" cy="64" r="64" fill="url(#g)"/>
    <text x="64" y="64" text-anchor="middle" dominant-baseline="central"
      font-family="sans-serif" font-size="54" font-weight="bold" fill="white">
      ${initial}
    </text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      avatarData: true,
      avatarMime: true,
      displayName: true,
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

  const label = user?.displayName ?? "?";
  return generateInitialAvatar(label);
}
