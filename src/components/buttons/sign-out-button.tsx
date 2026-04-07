"use client";

import { signOut } from "next-auth/react";

export const SignOutButton = () => {
  return (
    <button
      className="bg-red-light text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign out
    </button>
  );
};
