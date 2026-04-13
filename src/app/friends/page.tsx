import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  getPendingFriendRequestsByUserId,
  getAcceptedFriendsByUserId,
  getSentFriendRequestsByUserId,
} from "@/data/friendships";
import { FriendsClient } from "@/components/friends/FriendsClient";

// ---------- Raw Prisma return types ----------
type RawUser = {
  id: string;
  displayName: string | null;
  email: string | null;
};

type RawFriendshipWithRequester = {
  id: string;
  requester: RawUser;
};

type RawFriendshipWithAddressee = {
  id: string;
  addressee: RawUser;
};

type RawFriendshipBoth = {
  id: string;
  requesterId: string;
  requester: RawUser;
  addressee: RawUser;
};

// ---------- Helpers ----------
function resolveLabel(u: RawUser): string {
  return u.displayName || u.email || "Unknown user";
}

// ---------- Page ----------
export default async function FriendsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [incomingRequests, sentRequests, friends] = await Promise.all([
    getPendingFriendRequestsByUserId(userId),
    getSentFriendRequestsByUserId(userId),
    getAcceptedFriendsByUserId(userId),
  ]);

  return (
    <FriendsClient
      incomingRequests={(
        incomingRequests as unknown as RawFriendshipWithRequester[]
      ).map((f) => ({
        id: f.id,
        label: resolveLabel(f.requester),
        email: f.requester.email ?? undefined,
      }))}
      sentRequests={(
        sentRequests as unknown as RawFriendshipWithAddressee[]
      ).map((f) => ({
        id: f.id,
        label: resolveLabel(f.addressee),
        email: f.addressee.email ?? undefined,
      }))}
      friends={(friends as unknown as RawFriendshipBoth[]).map((f) => {
        const friend = f.requesterId === userId ? f.addressee : f.requester;
        return {
          id: f.id,
          label: resolveLabel(friend),
          email: friend.email ?? undefined,
        };
      })}
    />
  );
}
