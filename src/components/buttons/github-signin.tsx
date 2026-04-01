"use client";

import { signIn } from "next-auth/react";
import Button from "../Button";

export const GitSignInButton = () => {
  return (
    <Button onClick={() => signIn("github", { callbackUrl: "/" })}>
      Sign in with GitHub
    </Button>
  );
};
