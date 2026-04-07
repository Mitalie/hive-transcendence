"use client";

import { signIn } from "next-auth/react";
import Button from "../Button";
import { useTranslation } from "react-i18next";

export const GitSignInButton = () => {
  const { t } = useTranslation();
  return (
    <Button
      className="bg-gradient-to-r from-blue-dark to-purple-dark text-white"
      onClick={() =>
        signIn("github", { callbackUrl: "/registration/git-setup" })
      }
    >
      {t("auth.signInWithGitHub")}
    </Button>
  );
};
