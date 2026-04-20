import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

async function getDefaultAvatar() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "images",
    "user_icon.png",
  );
  const fileBuffer = await readFile(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
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

  return getDefaultAvatar();
}
