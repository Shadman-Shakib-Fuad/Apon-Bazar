"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Search/filter bodlale URL bodle dey, tarpor server notun product dekhay
export function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const pathRef = useRef(pathname);
  const latest = useRef(sp.toString());

  useEffect(() => {
    pathRef.current = pathname;
    latest.current = sp.toString();
  }, [pathname, sp]);

  const update = useCallback(
    (changes: Record<string, string | undefined>, opts?: { hash?: boolean }) => {
      const onHome = pathRef.current === "/";
      // Home page e thakle ager filter gulo rekhe, onno page theke ashle notun kore shuru
      const params = new URLSearchParams(onHome ? latest.current : "");

      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      // Seed thakle lekhar somoy product er random order bar bar bodlay na
      if (!params.get("seed")) {
        params.set("seed", String(Math.floor(Math.random() * 1_000_000_000)));
      }

      latest.current = params.toString();
      const url = `/?${params.toString()}`;

      startTransition(() => {
        if (onHome) router.replace(url, { scroll: false });
        else router.push(opts?.hash ? `${url}#products` : url);
      });
    },
    [router]
  );

  return { update, pending, sp, pathname };
}