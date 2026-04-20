// components/Providers.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/i18n";

export function Providers({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }

  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </SessionProvider>
  );
}
