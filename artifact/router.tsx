"use client";

// Routeur en mémoire pour la version « artefact » (une seule page HTML, sans serveur Next.js).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const ORIGIN = "https://paylinko.app";

type Ctx = { path: string; query: URLSearchParams; push: (href: string) => void; replace: (href: string) => void; back: () => void };

const RouterCtx = createContext<Ctx | null>(null);

function normalize(href: string) {
  if (href.startsWith(ORIGIN)) href = href.slice(ORIGIN.length) || "/";
  return href;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<string[]>(() => {
    try {
      return [sessionStorage.getItem("pl-route") || "/"];
    } catch {
      return ["/"];
    }
  });
  const current = stack[stack.length - 1];

  useEffect(() => {
    try {
      sessionStorage.setItem("pl-route", current);
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0);
  }, [current]);

  const push = useCallback((href: string) => setStack((s) => [...s, normalize(href)]), []);
  const replace = useCallback((href: string) => setStack((s) => [...s.slice(0, -1), normalize(href)]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);

  // Les liens absolus vers paylinko.app (liens de paiement, tag…) s'ouvrent dans l'artefact.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href");
      if (href && href.startsWith(ORIGIN)) {
        e.preventDefault();
        push(href);
      }
    };
    document.addEventListener("click", onClick, true);
    const open = window.open;
    window.open = ((url?: string | URL, ...rest: unknown[]) => {
      const u = String(url ?? "");
      if (u.startsWith(ORIGIN)) {
        push(u);
        return null;
      }
      return (open as (...a: unknown[]) => Window | null)(url, ...rest);
    }) as typeof window.open;
    return () => {
      document.removeEventListener("click", onClick, true);
      window.open = open;
    };
  }, [push]);

  const value = useMemo(() => {
    const [p, q = ""] = current.split("?");
    return { path: p, query: new URLSearchParams(q), push, replace, back };
  }, [current, push, replace, back]);

  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>;
}

export function useRouterCtx() {
  const c = useContext(RouterCtx);
  if (!c) throw new Error("RouterProvider manquant");
  return c;
}
