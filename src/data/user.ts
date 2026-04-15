import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      avatarMime: true,
      updatedAt: true,
      password: true,
      accounts: {
        select: {
          id: true,
          provider: true,
        },
      },
    },
  });
}

export async function setUserPassword(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
}
