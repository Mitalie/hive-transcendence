// Page Footer

/**
 * TODO
 * 1-Language change
 * 2-light mode control need to be changed to a toggle button or more clear display
 */

"use client";

import { useState, useEffect } from "react";

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
    <div
      className="header"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        padding: "10px 20px",
        borderRadius: "12px",
      }}
    >
      <button className="button">EN</button>
      <button className="button" onClick={() => setDark(!dark)}>
        {dark ? "Light" : "Dark"}
      </button>
    </div>
  );
}
