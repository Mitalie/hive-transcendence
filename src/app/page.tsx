import { getCurrentUser } from "@/data/user";
import { redirect } from "next/navigation";
import HomeClient from "@/components/home/HomeClient";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user && !user.displayName) redirect("/registration/profile");

  return <HomeClient />;
}
