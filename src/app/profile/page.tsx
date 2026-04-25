import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "@/components/profile/Profileclient";
import { getMatchStatsByUserId } from "@/data/matchHistory";

async function getProfileData(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      matches: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      sentFriendRequests: true,
      receivedFriendRequests: true,
    },
  });

  if (!user) return null;

  const stats = await getMatchStatsByUserId(user.id);

  const acceptedFriends = await prisma.friendship.count({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
  });
  const pendingSent = await prisma.friendship.count({
    where: { status: "PENDING", requesterId: user.id },
  });
  const pendingReceived = await prisma.friendship.count({
    where: { status: "PENDING", addresseeId: user.id },
  });

  const fmt = (date: Date | null, opts: Intl.DateTimeFormatOptions) =>
    date ? date.toLocaleDateString("en-GB", opts) : null;

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      avatarVersion: user.updatedAt.getTime(),
      joinedAt: fmt(user.createdAt, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      lastActiveAt: fmt(user.lastActiveAt, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      matches: user.matches.map((m) => ({
        id: m.id,
        score1: m.score1,
        score2: m.score2,
        player2: m.player2,
        matchDate: fmt(m.createdAt, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) as string,
        matchTime: m.createdAt.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    },
    stats,
    friendshipStats: { acceptedFriends, pendingSent, pendingReceived },
  };
}

export type ProfileData = Awaited<ReturnType<typeof getProfileData>>;

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const data = await getProfileData(session.user.email);
  if (!data) redirect("/login");
  if (!data.user.displayName) redirect("/registration/profile");
  return <ProfileClient data={data} />;
}
