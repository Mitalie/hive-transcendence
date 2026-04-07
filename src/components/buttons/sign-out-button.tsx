"use client";

import { signOut } from "next-auth/react";
import Button from "../Button";
import { useTranslation } from "react-i18next";

export const SignOutButton = () => {
  const { t } = useTranslation();
  return (
    <Button
      className="bg-red-light hover:bg-red-600 transition"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      {t("auth.signOut")}
    </Button>
  );
};
