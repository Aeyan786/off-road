"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Eye, ShoppingBag, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Sales change slowly; the endpoint is edge-cached for a minute anyway.
const SALES_REFRESH_MS = 5 * 60 * 1000;
const VIEWER_ID_KEY = "orp:viewer-id";
const DISMISSED_PREFIX = "orp:activity-dismissed:";

/**
 * One id per browser (not per tab), so the same shopper with the product
 * open in three tabs is counted once. Falls back to a per-tab id where
 * storage is unavailable (private browsing, blocked storage).
 */
function browserViewerId() {
  const fresh = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  try {
    let id = localStorage.getItem(VIEWER_ID_KEY);
    if (!id) {
      id = fresh();
      localStorage.setItem(VIEWER_ID_KEY, id);
    }
    return id;
  } catch {
    return fresh();
  }
}

// Dismissal lives in sessionStorage: hidden for this product until the tab
// is closed. Read through useSyncExternalStore so the server render (which
// can't see storage) and the first client render agree.
const dismissListeners = new Set();
const subscribeDismissed = (listener) => {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
};
function readDismissed(productId) {
  try {
    return sessionStorage.getItem(DISMISSED_PREFIX + productId) === "1";
  } catch {
    return false;
  }
}

/**
 * Bottom-right notice on a product page: how many other shoppers have it
 * open right now, and how many units sold in the last 24 hours. Both are
 * real: viewers come from Supabase Realtime presence (no polling, no
 * database writes; a closed tab drops out on its own), sales from paid,
 * non-cancelled, non-refunded orders. A zero is never shown, and if both
 * are zero there is no notice at all.
 *
 * @param {string} productId
 * @param {number} initialSoldLast24h computed on the server for first paint
 */
export default function ProductActivityToast({ productId, initialSoldLast24h = 0 }) {
  const [otherViewers, setOtherViewers] = useState(0);
  const [soldLast24h, setSoldLast24h] = useState(initialSoldLast24h);

  const dismissed = useSyncExternalStore(
    subscribeDismissed,
    () => readDismissed(productId),
    () => true // hidden during server render; appears after hydration
  );

  // Live viewers. Runs even when the notice is dismissed: a shopper who
  // closed it is still viewing, and still counts for everyone else.
  useEffect(() => {
    let channel;
    let supabase;
    const me = browserViewerId();

    const onVisibility = () => {
      if (!channel) return;
      // A tab in the background isn't "viewing", so it stops counting.
      const action =
        document.visibilityState === "visible"
          ? channel.track({ since: Date.now() })
          : channel.untrack();
      action?.catch?.(() => {});
    };

    try {
      supabase = createClient();
      channel = supabase.channel(`product-viewers:${productId}`, {
        config: { presence: { key: me } },
      });

      channel.on("presence", { event: "sync" }, () => {
        // Keys are browsers; the shopper's own browser is never counted.
        const others = Object.keys(channel.presenceState()).filter((key) => key !== me);
        setOtherViewers(others.length);
      });

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED" && document.visibilityState === "visible") {
          channel.track({ since: Date.now() }).catch(() => {});
        }
      });

      document.addEventListener("visibilitychange", onVisibility);
    } catch (err) {
      // Realtime unavailable: no viewer line, the page carries on.
      console.warn("[product activity] viewers unavailable:", err?.message);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, [productId]);

  // 24-hour sales, refreshed while the page stays open.
  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(`/api/products/${productId}/activity`);
        if (!response.ok) return;
        const { soldLast24h: sold } = await response.json();
        if (!cancelled && Number.isFinite(sold)) setSoldLast24h(sold);
      } catch {
        // Keep showing the last known figure.
      }
    };

    const timer = setInterval(refresh, SALES_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [productId]);

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISSED_PREFIX + productId, "1");
    } catch {
      // Storage blocked — it still hides for as long as this page is open.
    }
    dismissListeners.forEach((listener) => listener());
  }

  const showViewers = otherViewers > 0;
  const showSales = soldLast24h > 0;
  if (dismissed || (!showViewers && !showSales)) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-30 w-[calc(100vw-2rem)] max-w-xs rounded-md border border-neutral-200 bg-white py-3 pl-3 pr-10 shadow-lg animate-in fade-in slide-in-from-bottom-2"
    >
      <ul className="space-y-1.5 text-sm text-neutral-700">
        {showViewers ? (
          <li className="flex items-start gap-2">
            <Eye className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <span>
              <span className="font-semibold text-neutral-900">{otherViewers}</span>{" "}
              {otherViewers === 1 ? "other person is" : "other people are"} viewing this right now
            </span>
          </li>
        ) : null}
        {showSales ? (
          <li className="flex items-start gap-2">
            <ShoppingBag className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <span>
              <span className="font-semibold text-neutral-900">{soldLast24h}</span> sold in the
              last 24 hours
            </span>
          </li>
        ) : null}
      </ul>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 cursor-pointer rounded-sm p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
