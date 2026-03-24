import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";

export async function getUserFromRequest(req: NextRequest) {
  const userIdCookie = req.cookies.get("userId")?.value;
  if (!userIdCookie) return null;

  const userId = Number(userIdCookie);
  if (!Number.isInteger(userId) || userId <= 0) return null;

  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
};
