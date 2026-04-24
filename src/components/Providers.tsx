"use client";
import { useState, useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { I18nextProvider } from "react-i18next";
import { createI18n } from "@/i18n/i18n";

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && !session?.user)
    ) {
      signOut({ redirect: false });
    }
  }, [status, session]);

  return <>{children}</>;
}

export function Providers({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: string;
}) {
  const [i18nInstance] = useState(() => createI18n(initialLang));

  return (
    <SessionProvider>
      <SessionGuard>
        <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
      </SessionGuard>
    </SessionProvider>
  );
}
