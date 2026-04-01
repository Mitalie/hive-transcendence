"use client";

import { signOut } from "next-auth/react";
import Button from "../Button";

export const SignOutButton = () => {
  return (
    // <button
    //   className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
    <Button onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</Button>
    // </button>
  );
};
