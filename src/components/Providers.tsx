"use client";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { I18nextProvider } from "react-i18next";
import { createI18n } from "@/i18n/i18n";

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
      <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
    </SessionProvider>
  );
}
