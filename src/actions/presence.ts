"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updatePresenceAction() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() },
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}
