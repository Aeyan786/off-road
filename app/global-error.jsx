"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import "./globals.css";

/**
 * Last line of defence: an error thrown by the root layout itself, which
 * means no layout is available — so this file renders its own html/body and
 * can't use the shared ErrorState component.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="bg-white antialiased">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-neutral-100">
            <AlertTriangle className="size-6 text-neutral-500" />
          </span>

          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Something went wrong
          </h1>
          <p className="text-sm leading-relaxed text-neutral-500">
            The page couldn&apos;t be loaded. Please try again, or come back in a moment.
          </p>

          {error?.digest ? (
            <p className="rounded-sm border bg-neutral-50 px-3 py-1.5 text-xs text-neutral-400">
              Reference: {error.digest}
            </p>
          ) : null}

          <button
            type="button"
            onClick={reset}
            className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-sm bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
