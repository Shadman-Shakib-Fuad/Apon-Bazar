"use client";

import { useRef, useState } from "react";

// Number e double-click korle edit kora jay, Enter chaple save, Esc chaple bondho
export default function QtyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const cancelled = useRef(false);

  function commit() {
    if (cancelled.current) {
      cancelled.current = false;
      setEditing(false);
      return;
    }
    const n = Math.floor(Number(draft));
    if (Number.isFinite(n) && n >= 1) onChange(Math.min(n, 99));
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        inputMode="numeric"
        min={1}
        max={99}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            cancelled.current = true;
            e.currentTarget.blur();
          }
        }}
        className="w-14 rounded-lg border-2 border-primary px-1 py-1 text-center text-sm font-semibold outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      title="Double-click to type a quantity"
      onDoubleClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className="w-8 cursor-text select-none text-center text-sm font-semibold"
    >
      {value}
    </button>
  );
}