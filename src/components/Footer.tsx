// Page Footer

/**
 * TODO
 * 1-Language change button will changed later, so didn't make a component now
 * 2-light mode control need to be changed to a toggle button or more clear display
 */

"use client";

import { useState, useEffect } from "react";
import Bar from "@/components/Bar";

export default function Footer() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <Bar
      className="justify-end gap-2.5"
    >
      <button className="px-4 py-2 rounded-xl bg-button text-text hover:bg-button-hover transition-colors">
        EN
      </button>

      <button
        onClick={() => setDark(!dark)}
        className="px-4 py-2 rounded-xl bg-button text-text hover:bg-button-hover transition-colors"
      >
        {dark ? "Light" : "Dark"}
      </button>
    </Bar>
  );
}
