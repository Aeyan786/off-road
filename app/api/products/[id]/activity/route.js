import { NextResponse } from "next/server";
import { getUnitsSoldLast24h } from "@/lib/data/productActivity";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public read of one product's recent sales, for the product page's
 * activity toast to refresh without a page reload.
 *
 * Exposes a single number and nothing about the orders behind it. Responses
 * are cached at the edge for a minute (and served stale while refreshing),
 * so however many shoppers have the product open, the database sees at
 * most about one query per product per minute.
 *
 * Live viewers are not served from here — they come straight from Supabase
 * Realtime presence in the browser, with no request to this app at all.
 */
export async function GET(_request, { params }) {
  const { id } = await params;

  if (!UUID.test(id ?? "")) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  try {
    const soldLast24h = await getUnitsSoldLast24h(id);
    return NextResponse.json(
      { soldLast24h },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=240",
        },
      }
    );
  } catch (err) {
    console.error("[product activity]", err.message);
    // The toast simply hides its sales line; the page is never affected.
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }
}
