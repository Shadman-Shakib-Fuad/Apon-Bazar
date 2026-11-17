"use client";

import { useEffect, useState } from "react";

// Protit second e 1 kore kome. Resend button e "Resend in 45s" dekhanor jonno
export function useCooldown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return [seconds, setSeconds] as const;
}