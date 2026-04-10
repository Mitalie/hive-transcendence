import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/data/user";
import { SettingsClient } from "./settingsClient";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await getCurrentUser();
  const hasGithub =
    user?.accounts.some((a) => a.provider === "github") ?? false;
  const hasPassword = !!user?.password;

  return (
    <SettingsClient
      userId={user?.id ?? null}
      displayName={user?.displayName ?? null}
      email={user?.email ?? null}
      bio={user?.bio ?? null}
      avatarUrl={user?.avatarUrl ?? null}
      hasStoredAvatar={!!user?.avatarData}
      hasGithub={hasGithub}
      hasPassword={hasPassword}
      error={error ?? null}
    />
  );
}
