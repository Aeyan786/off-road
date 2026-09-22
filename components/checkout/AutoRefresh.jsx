"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-renders the current server page every `intervalMs` (used while the
 * success page waits for Stripe's webhook). After `maxAttempts` it stops and
 * shows `children` instead.
 */
export default function AutoRefresh({ intervalMs = 2000, maxAttempts = 30, children }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const done = attempts >= maxAttempts;

  useEffect(() => {
    if (done) return;
    const timer = setTimeout(() => {
      router.refresh();
      setAttempts((n) => n + 1);
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [attempts, done, intervalMs, router]);

  return done ? children : null;
}
