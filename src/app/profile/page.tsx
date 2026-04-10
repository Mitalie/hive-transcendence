import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getProfileData(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      matches: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      sentFriendRequests: true,
      receivedFriendRequests: true,
    },
  });

  if (!user) {
    return null;
  }

  const wins = user.matches.filter(
    (match) => match.score1 > match.score2,
  ).length;
  const losses = user.matches.filter(
    (match) => match.score1 < match.score2,
  ).length;
  const draws = user.matches.filter(
    (match) => match.score1 === match.score2,
  ).length;

  const totalMatches = user.matches.length;

  const winRate =
    totalMatches === 0 ? "0.0" : ((wins / totalMatches) * 100).toFixed(1);

  const acceptedFriends = await prisma.friendship.count({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
  });

  const pendingSent = await prisma.friendship.count({
    where: {
      status: "PENDING",
      requesterId: user.id,
    },
  });

  const pendingReceived = await prisma.friendship.count({
    where: {
      status: "PENDING",
      addresseeId: user.id,
    },
  });

  return {
    user,
    stats: {
      totalMatches,
      wins,
      losses,
      draws,
      winRate,
    },
    friendshipStats: {
      acceptedFriends,
      pendingSent,
      pendingReceived,
    },
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const data = await getProfileData(session.user.email);

  if (!data) {
    redirect("/login");
  }

  const { user, stats, friendshipStats } = data;

  const avatarSrc = user.avatarData
    ? `/api/avatar/${user.id}`
    : user.avatarUrl || null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <section className="mb-8 rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt={
                  user.displayName ||
                  user.username ||
                  user.name ||
                  "Profile avatar"
                }
                className="h-24 w-24 rounded-full object-cover border"
              />
            ) : (
              <div className="h-24 w-24 rounded-full border bg-gray-100 flex items-center justify-center text-3xl font-semibold text-gray-600">
                {(user.displayName ||
                  user.username ||
                  user.name ||
                  user.email ||
                  "?")[0].toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold">
                {user.displayName || user.username || user.name || "Profile"}
              </h1>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>Email: {user.email || "-"}</p>
                <p>Username: {user.username || "-"}</p>
                <p>Name: {user.name || "-"}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/matches"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Match history
            </Link>
            <Link
              href="/friends"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Friends
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">Bio</h2>
          <p className="text-sm text-gray-700">
            {user.bio || "No bio added yet."}
          </p>
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total matches</p>
          <p className="mt-2 text-2xl font-bold">{stats.totalMatches}</p>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Wins</p>
          <p className="mt-2 text-2xl font-bold">{stats.wins}</p>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Losses</p>
          <p className="mt-2 text-2xl font-bold">{stats.losses}</p>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Win rate</p>
          <p className="mt-2 text-2xl font-bold">{stats.winRate}%</p>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Friendship stats</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Accepted friends</span>
              <span className="font-semibold">
                {friendshipStats.acceptedFriends}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Pending sent</span>
              <span className="font-semibold">
                {friendshipStats.pendingSent}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Pending received</span>
              <span className="font-semibold">
                {friendshipStats.pendingReceived}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Account details</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Display name</span>
              <span className="font-semibold">{user.displayName || "-"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Avatar URL</span>
              <span className="max-w-[180px] truncate font-semibold">
                {user.avatarUrl || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Last active</span>
              <span className="font-semibold">
                {user.lastActiveAt
                  ? new Date(user.lastActiveAt).toLocaleString()
                  : "-"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Joined</span>
              <span className="font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent matches</h2>

          <Link
            href="/matches"
            className="text-sm font-medium underline underline-offset-4"
          >
            See all
          </Link>
        </div>

        {user.matches.length === 0 ? (
          <p className="text-sm text-gray-600">No matches played yet.</p>
        ) : (
          <div className="space-y-3">
            {user.matches.map((match) => {
              const result =
                match.score1 > match.score2
                  ? "Win"
                  : match.score1 < match.score2
                    ? "Loss"
                    : "Draw";

              return (
                <div
                  key={match.id}
                  className="flex flex-col gap-2 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">vs {match.player2}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(match.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-semibold">
                      {match.score1} - {match.score2}
                    </p>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        result === "Win"
                          ? "bg-green-100 text-green-700"
                          : result === "Loss"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {result}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
