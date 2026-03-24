import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function getUserFromRequest(req: NextRequest) {
  const userIdCookie = req.cookies.get("userId")?.value;
  if (!userIdCookie) return null;

  const userId = Number(userIdCookie);
  if (!Number.isInteger(userId) || userId <= 0) return null;

  return prisma.user.findUnique({
    where: { id: userId },
  });
}
