"use client";

import { useEffect, useState } from "react";

/** Vrai une fois le composant monté côté client (et donc le store localStorage réhydraté). */
export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}

export function useOrigin() {
  const [origin, setOrigin] = useState("https://paylinko.app");
  useEffect(() => setOrigin((window as unknown as { __PL_ORIGIN__?: string }).__PL_ORIGIN__ ?? window.location.origin), []);
  return origin;
}
