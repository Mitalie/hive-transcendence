import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/data/user";
import Link from "next/link";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  return (
    <div>
      <h1>Profile Page</h1>
      <p>Your display name is: {user?.displayName ?? "Not set"}</p>
      <p>Your email: {user?.email ?? "Not set"}</p>
      <Link href="/settings">
        <button className="bg-black text-white flex justify-between items-center px-6 py-2.5 rounded-xl">
          Check your Settings
        </button>
      </Link>
    </div>
  );
}
