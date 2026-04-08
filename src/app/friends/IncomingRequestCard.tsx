import {
  acceptFriendRequest,
  declineFriendRequest,
} from "@/actions/friendships";

type Props = {
  friendshipId: string;
  name: string | null;
  username: string | null;
};

export default function IncomingRequestCard({
  friendshipId,
  name,
  username,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-medium">{name || username || "Unknown user"}</p>
        <p className="text-sm text-gray-600">{username || "No username"}</p>
      </div>

      <div className="flex gap-3">
        <form
          action={async () => {
            "use server";
            await acceptFriendRequest(friendshipId);
          }}
        >
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
          >
            Accept
          </button>
        </form>

        <form
          action={async () => {
            "use server";
            await declineFriendRequest(friendshipId);
          }}
        >
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
          >
            Decline
          </button>
        </form>
      </div>
    </div>
  );
}
