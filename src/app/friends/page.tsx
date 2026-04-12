import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  getPendingFriendRequestsByUserId,
  getAcceptedFriendsByUserId,
  getSentFriendRequestsByUserId,
} from "@/data/friendships";
import { getAvailableUsersForFriendRequest } from "@/data/users";
import FriendCard from "./FriendCard";
import IncomingRequestCard from "./IncomingRequestCard";
import SentRequestCard from "./SentRequestCard";
import DiscoverUserCard from "./DiscoverUserCard";

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [incomingRequests, sentRequests, friends, discoverUsers] =
    await Promise.all([
      getPendingFriendRequestsByUserId(userId),
      getSentFriendRequestsByUserId(userId),
      getAcceptedFriendsByUserId(userId),
      getAvailableUsersForFriendRequest(userId),
    ]);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <section>
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your friends and requests.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Friends</p>
          <p className="mt-2 text-2xl font-bold">{friends.length}</p>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Incoming requests</p>
          <p className="mt-2 text-2xl font-bold">{incomingRequests.length}</p>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <p className="text-sm text-gray-500">Sent requests</p>
          <p className="mt-2 text-2xl font-bold">{sentRequests.length}</p>
        </div>
      </section>

      <section className="rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Incoming requests</h2>

        {incomingRequests.length === 0 ? (
          <p className="text-sm text-gray-600">No incoming requests.</p>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((friendship) => (
              <IncomingRequestCard
                key={friendship.id}
                friendshipId={friendship.id}
                name={friendship.requester.name}
                username={friendship.requester.username}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Your friends</h2>

        {friends.length === 0 ? (
          <p className="text-sm text-gray-600">You have no friends yet.</p>
        ) : (
          <div className="space-y-4">
            {friends.map((friendship) => {
              const friend =
                friendship.requesterId === userId
                  ? friendship.addressee
                  : friendship.requester;

              return (
                <FriendCard
                  key={friendship.id}
                  friendshipId={friendship.id}
                  name={friend.name}
                  username={friend.username}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Sent requests</h2>

        {sentRequests.length === 0 ? (
          <p className="text-sm text-gray-600">No pending sent requests.</p>
        ) : (
          <div className="space-y-4">
            {sentRequests.map((friendship) => (
              <SentRequestCard
                key={friendship.id}
                friendshipId={friendship.id}
                name={friendship.addressee.name}
                username={friendship.addressee.username}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Find people</h2>

        {discoverUsers.length === 0 ? (
          <p className="text-sm text-gray-600">
            No more users available to add right now.
          </p>
        ) : (
          <div className="space-y-4">
            {discoverUsers.map((user) => (
              <DiscoverUserCard
                key={user.id}
                userId={user.id}
                name={user.name}
                username={user.username}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
