"use client";

import { ReactNode, useState } from "react";

export default function ShowHide({
  children,
  label
}: Readonly<{
  children: ReactNode;
  label: string;
}>
) {
  const [show, setShow] = useState(false);

  return (
    <>
      <label>
        <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} />
        {label}
      </label>
      {show ? children : null}
    </>
  );
}
