// Home page
"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="relative flex-1 rounded-xl overflow-hidden flex items-center">
      {/* left part */}
      <div className="space-y-6 w-full max-w-7xl mx-auto px-0 md:px-16 lg:px-24">
        <h1 className="font-bold text-text text-4xl md:text-5xl lg:text-6xl">
          {t("home.welcome")}
        </h1>

        <p className="text-text text-xl md:text-2xl">{t("home.intro")}</p>

        <div className="inline-flex">
          <Link
            href="/game"
            className="
              px-24 py-4 rounded-2xl
              text-white text-4xl
              bg-gradient-to-r from-blue-dark to-purple-dark
              shadow-md
              hover:scale-105 active:scale-95
              transition-transform duration-200 will-change-transform
            "
          >
            {t("home.startgame")}
          </Link>
        </div>
      </div>

      {/* right part */}
      <Image
        src="/images/placeholder_homepage.png"
        alt="preview"
        width={1024}
        height={1024}
        className="h-full w-auto ml-auto object-cover"
      />
    </div>
  );
}
