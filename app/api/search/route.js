import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/data/products";

// Keep in sync with MIN_QUERY_LENGTH in components/header/HeaderSearch.jsx.
const MIN_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 5;

const priceFormatter = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

/**
 * Header search-as-you-type. Uses the same getProducts() search as the
 * /products?q= results page (same fields, active products only), capped at
 * five suggestions, so a suggestion never shows something the full results
 * wouldn't.
 *
 * GET /api/search?q=brake -> { products: [{ id, title, subtitle, image, price }] }
 */
export async function GET(request) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < MIN_QUERY_LENGTH) return NextResponse.json({ products: [] });

  try {
    const supabase = await createClient();
    const rows = await getProducts(supabase, { search: q, limit: MAX_SUGGESTIONS });

    return NextResponse.json({
      products: rows.map((row) => ({
        id: row.id,
        title: row.product,
        subtitle: [row.manufacturer, row.model, row.year].filter(Boolean).join(" · "),
        image: row.images?.[0] ?? null,
        price: priceFormatter.format(Number(row.discount_price ?? row.price ?? 0)),
      })),
    });
  } catch (err) {
    console.error("[api/search]", err.message);
    return NextResponse.json({ error: "Search is unavailable right now." }, { status: 500 });
  }
}
