"use client";
import { useState, useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { I18nextProvider } from "react-i18next";
import { createI18n } from "@/i18n/i18n";

function SessionGuard() {
  const { data: session } = useSession();

  useEffect(() => {
    // The session is invalid if server doesn't recognize the user.
    // Clear out the useless session cookie to avoid confusion.
    if (session && !session.user) {
      signOut({ redirect: false });
    }
  }, [session]);

  return null;
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
      <SessionGuard />
      <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
    </SessionProvider>
  );
}
