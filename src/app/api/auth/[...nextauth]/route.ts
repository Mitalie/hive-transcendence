// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    signIn: "/login", // optional: custom login page
  },
};

// ✅ This is the key: export both GET and POST to support NextAuth actions
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };