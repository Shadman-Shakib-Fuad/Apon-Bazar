"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useQueryUpdater } from "@/components/shop/useQueryUpdater";

type Variant = "hero" | "nav" | "mobile" | "bar";

const wrapper: Record<Variant, string> = {
  hero: "mx-auto mt-6 flex max-w-xl items-center overflow-hidden rounded-full bg-white shadow-lg",
  nav: "ml-auto hidden max-w-xs flex-1 items-center rounded-full border border-gray-200 bg-cream px-3 md:flex",
  mobile: "mb-3 flex items-center rounded-full border border-gray-200 bg-cream px-3",
  bar: "relative flex items-center rounded-xl border border-gray-200 bg-white px-3 focus-within:border-primary sm:col-span-2",
};

const inputClass: Record<Variant, string> = {
  hero: "w-full bg-transparent px-3 py-3 text-sm outline-none",
  nav: "w-full bg-transparent px-2 py-2 text-sm outline-none",
  mobile: "w-full bg-transparent px-2 py-2 text-sm outline-none",
  bar: "w-full bg-transparent px-2 py-2.5 text-sm outline-none",
};

export default function LiveSearchBox({
  variant,
  placeholder,
}: {
  variant: Variant;
  placeholder: string;
}) {
  const { update, pending, sp } = useQueryUpdater();
  const urlQ = sp.get("q") ?? "";

  const [value, setValue] = useState(urlQ);
  const lastSent = useRef(urlQ);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Onno jaygay (jemon Clear button e) q bodlale ei box o bodle jay
  useEffect(() => {
    if (urlQ !== lastSent.current) {
      lastSent.current = urlQ;
      setValue(urlQ);
    }
  }, [urlQ]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function send(v: string) {
    const q = v.trim();
    lastSent.current = q;
    update({ q: q || undefined }, { hash: variant === "nav" || variant === "mobile" });
  }

  function onChange(v: string) {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    // 300ms thamle search hobe, protita akkhore na
    timer.current = setTimeout(() => send(v), 300);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    send(value);
    if (variant === "hero") {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function clear() {
    setValue("");
    if (timer.current) clearTimeout(timer.current);
    send("");
  }

  return (
    <form onSubmit={onSubmit} className={wrapper[variant]}>
      <Search
        size={variant === "hero" ? 18 : 16}
        className={`shrink-0 text-gray-400 ${variant === "hero" ? "ml-4" : ""}`}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass[variant]}
      />
      {pending && <Loader2 size={16} className="mr-2 shrink-0 animate-spin text-primary" />}
      {value && !pending && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="mr-2 shrink-0 text-gray-400 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      )}
      {variant === "hero" && (
        <button className="self-stretch bg-accent px-6 text-sm font-semibold text-white hover:opacity-90">
          Search
        </button>
      )}
    </form>
  );
}