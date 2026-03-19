import { getCurrentUser } from "@/data/demo";
import Link from "next/link";
import { ReactNode } from "react";

export default async function DataDemoLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const me = await getCurrentUser();
  return (
    <>
      <div>
        <Link href="/data-demo/play"><button>Play!</button></Link>
        <Link href="/data-demo/users"><button>User list</button></Link>
        <Link href={"/data-demo/user/" + me.id}><button>{me.name}</button></Link>
      </div>
      {children}
    </>
  );
}
