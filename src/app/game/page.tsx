import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Game from "@/game/Game";

async function getPlayerName(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { displayName: true },
  });
  return user?.displayName ?? null;
}

export default async function GamePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.email;
  const playerName = isLoggedIn
    ? await getPlayerName(session!.user!.email!)
    : null;

  return <Game isLoggedIn={isLoggedIn} playerName={playerName} />;
}
