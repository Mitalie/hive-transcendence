import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginPageClient from "./_pageClient";

export default async function LoginPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/");
  return <LoginPageClient />;
}
