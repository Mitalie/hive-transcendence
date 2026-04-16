import { redirect } from "next/navigation";
import { getCurrentUser } from "@/data/user";
import { SettingsClient } from "@/components/settings/settingsClient";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SettingsClient
      user={{
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        hasStoredAvatar: !!user.avatarMime,
        avatarVersion: user.updatedAt.getTime(),
        hasGithub: user.accounts.some((a) => a.provider === "github"),
        hasPassword: !!user.password,
      }}
      error={error ?? null}
    />
  );
}
