"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export const SignInButton = () => {
  const { t } = useTranslation();
  return (
    <Link href="/login">
      <button className="bg-gradient-to-r from-blue-dark to-purple-dark text-white flex justify-between items-center px-6 py-2.5 rounded-xl">
        {t("auth.signIn")}
      </button>
    </Link>
  );
};
