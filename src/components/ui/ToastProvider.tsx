"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

type Toast = {
  id: number;
  title: string;
  message?: string;
  href?: string;
  hrefLabel?: string;
};

type ToastInput = Omit<Toast, "id">;

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (t: ToastInput) => {
      const id = Date.now() + Math.random();
      // Ekshathe sorbocho 3ta popup
      setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}

      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-toast-in pointer-events-auto flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-lg"
          >
            <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-green-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900">{t.title}</p>
              {t.message && <p className="truncate text-xs text-gray-500">{t.message}</p>}
              {t.href && (
                <Link
                  href={t.href}
                  onClick={() => dismiss(t.id)}
                  className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                >
                  {t.hrefLabel ?? "View"}
                </Link>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Close"
              className="shrink-0 text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside ToastProvider");
  return show;
}