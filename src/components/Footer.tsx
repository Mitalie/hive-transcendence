// Page Footer

/**
 * TODO
 * 1-light mode control need to be changed to a toggle button or more clear display
 */

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

  // get language list from i18n files
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
    <Bar className="justify-between gap-2.5">
      {/* LEFT: label + links */}
      <div className={`flex items-center gap-4 text-sm text-text font-sans`}>
        <span>{t("footer.label")}</span>

        <Link href="/terms" className="hover:underline text-text">
          {t("footer.termsLink")}
        </Link>

        <Link href="/privacy" className="hover:underline text-text">
          {t("footer.privacyLink")}
        </Link>
      </div>

      {/* RIGHT: controls */}
      <div className="flex gap-2.5">
        <div className="relative w-26" ref={ref}>
          {/*  button shows current languge */}
          <Button className="w-26" onClick={() => setOpen(!open)}>
            {currentLang.label}
          </Button>

          {/* Drop-down menu for choosing language */}
          {open && (
            <ul className="absolute z-10 w-full mb-1 bottom-full bg-button rounded-xl shadow-lg overflow-hidden">
              {languages.map((lang) => (
                <li
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`
                  px-4 py-2 cursor-pointer
                  hover:bg-button-hover
                  ${i18n.language === lang.code ? "bg-button-active text-white" : "text-text"}
                `}
                >
                  {lang.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="w-26 px-4 py-2 rounded-xl bg-button text-text hover:bg-button-hover transition-colors"
        >
          {dark ? t("footer.light") : t("footer.dark")}
        </button>
      </div>
    </Bar>
  );
}
