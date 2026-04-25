import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Game from "@/game/Game";

async function getPlayerName(id: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { displayName: true },
  });
  return user?.displayName ?? null;
}

export default async function GamePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;
  const playerName = isLoggedIn
    ? await getPlayerName(session!.user!.id!)
    : null;

  return <Game isLoggedIn={isLoggedIn} playerName={playerName} />;
}
