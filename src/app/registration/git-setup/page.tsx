import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/data/user";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await getCurrentUser();

  if (!user?.displayName) {
    redirect(`/registration/profile?userId=${user?.id}`);
  }

  redirect("/");
}
