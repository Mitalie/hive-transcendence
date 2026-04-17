"use client";

import { useState, useEffect, useRef } from "react";
import Bar from "@/components/Bar";
import { useTranslation } from "react-i18next";
import Button from "@/components/Button";
import Link from "next/link";

export default function Footer() {
  const [dark, setDark] = useState(false);
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const languages = Object.keys(i18n.options.resources || {}).map((code) => ({
    code,
    label: t(`footer.languageLabel.${code}`, code),
  }));
  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Bar className="gap-2.5">
      {/* LEFT: label + links */}
      <div className="flex items-center gap-4 text-sm font-sans min-w-0">
        {/* Copyright label — hidden on very small screens */}
        <span className="hidden sm:block shrink-0">{t("footer.label")}</span>

        <Link href="/terms" className="hover:underline shrink-0">
          <span className="sm:hidden">{t("footer.termsLinkShort")}</span>
          <span className="hidden sm:inline">{t("footer.termsLink")}</span>
        </Link>

        <Link href="/privacy" className="hover:underline shrink-0">
          <span className="sm:hidden">{t("footer.privacyLinkShort")}</span>
          <span className="hidden sm:inline">{t("footer.privacyLink")}</span>
        </Link>
      </div>

      {/* RIGHT: controls */}
      <div className="flex gap-2 shrink-0">
        {/* Language picker */}
        <div className="relative" ref={ref}>
          <Button
            className="bg-btn-blue hover:bg-btn-blue-hover flex items-center gap-1.5"
            onClick={() => setOpen(!open)}
          >
            {/* On small screens show a globe icon, on sm+ show the language label */}
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="hidden sm:inline">{currentLang.label}</span>
          </Button>

          {open && (
            <ul className="absolute z-10 w-36 mb-1 bottom-full right-0 bg-card rounded-xl shadow-lg overflow-hidden">
              {languages.map((lang) => (
                <li
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`
                    px-4 py-2 text-sm cursor-pointer
                    hover:bg-btn-blue-hover
                    ${i18n.language === lang.code ? "bg-btn-blue" : ""}
                  `}
                >
                  {lang.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dark mode toggle */}
        <Button
          onClick={() => setDark(!dark)}
          className="bg-btn-blue hover:bg-btn-blue-hover flex items-center gap-1.5"
        >
          {/* Icon always visible */}
          {dark ? (
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14A7 7 0 0012 5z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </svg>
          )}
          {/* Label hidden on small screens */}
          <span className="hidden sm:inline">
            {dark ? t("footer.light") : t("footer.dark")}
          </span>
        </Button>
      </div>
    </Bar>
  );
}
