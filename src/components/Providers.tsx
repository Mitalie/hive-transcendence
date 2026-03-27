"use client";

import { SessionProvider } from "next-auth/react";
import { I18nextProvider } from "react-i18next";
import i18n, { initI18n } from "@/app/i18n/i18n";

initI18n();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </SessionProvider>
  );
}
