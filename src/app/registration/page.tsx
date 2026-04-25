import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import RegistrationPageClient from "./_pageClient";

export default async function LoginPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/");
  return <RegistrationPageClient />;
}
