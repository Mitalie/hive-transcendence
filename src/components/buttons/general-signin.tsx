"use client";
import Link from "next/link";

export const SignInButton = () => {
  return (
    <Link href="/login">
      <button className="bg-black text-white flex justify-between items-center px-6 py-2.5 rounded-xl">
        Sign In
      </button>
    </Link>
  );
};
