"use client";

import { signIn } from "next-auth/react";

export const GitSignInButton = () => {
  return (
    <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
    onClick={() => signIn("github", { callbackUrl: "/" })}>
      Sign in with GitHub
    </button>
  );
};