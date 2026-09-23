import { createAdminClient } from "@/lib/supabase/admin";
import { bucketKey } from "@/lib/reports/period";

/**
 * Storefront visitor analytics (0012_refunds_reviews_analytics.sql).
 *
 * Each row in page_views is one view by an anonymous cookie id; no IP
 * addresses are stored. Definitions used across the page:
 *   - visitors  = distinct cookie ids seen in the period
 *   - new       = ids whose very first view was in this period
 *   - returning = visitors − new
 * Reads use the service role: the tables are not exposed to the public key.
 */

const PAGE_SIZE = 1000;

async function viewsBetween(start, end) {
  const admin = createAdminClient();
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("page_views")
      .select("visitor_id, path, country, device, is_new_visitor, occurred_at")
      .gte("occurred_at", start.toISOString())
      .lt("occurred_at", end.toISOString())
      .order("occurred_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < PAGE_SIZE) return rows;
  }
}

/** Distinct visitors per key, plus their view count. */
function groupVisitors(rows, keyOf) {
  const map = new Map();
  for (const row of rows) {
    const key = keyOf(row) ?? "—";
    const group = map.get(key) ?? { key, visitors: new Set(), views: 0 };
    group.visitors.add(row.visitor_id);
    group.views += 1;
    map.set(key, group);
  }
  return [...map.values()]
    .map((g) => ({ key: g.key, name: g.key, visitors: g.visitors.size, views: g.views }))
    .sort((a, b) => b.visitors - a.visitors);
}

function summarize(rows) {
  const visitors = new Set();
  const newVisitors = new Set();
  for (const row of rows) {
    visitors.add(row.visitor_id);
    if (row.is_new_visitor) newVisitors.add(row.visitor_id);
  }
  return {
    visitors: visitors.size,
    newVisitors: newVisitors.size,
    returningVisitors: visitors.size - newVisitors.size,
    pageViews: rows.length,
    viewsPerVisitor: visitors.size ? rows.length / visitors.size : 0,
  };
}

const change = (current, previous) => (previous > 0 ? (current - previous) / previous : null);

let regionNames;
/** "GB" → "United Kingdom" (falls back to the raw code). */
export function countryName(code) {
  if (!code || code === "—") return "Unknown";
  regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export async function getVisitorReport(period) {
  const [current, previous] = await Promise.all([
    viewsBetween(period.start, period.end),
    viewsBetween(period.previous.start, period.previous.end),
  ]);

  const totals = summarize(current);
  const prior = summarize(previous);

  // Visitors and views per chart bucket (UK time).
  const byBucket = new Map(
    period.buckets.map((b) => [b.key, { ...b, value: 0, visitors: new Set(), views: 0 }])
  );
  for (const row of current) {
    const bucket = byBucket.get(bucketKey(period.type, row.occurred_at));
    if (!bucket) continue;
    bucket.visitors.add(row.visitor_id);
    bucket.views += 1;
  }

  const devices = groupVisitors(current, (r) => r.device);
  const byDevice = ["mobile", "desktop", "tablet"].map((key) => ({
    key,
    name: key[0].toUpperCase() + key.slice(1),
    visitors: devices.find((d) => d.key === key)?.visitors ?? 0,
    views: devices.find((d) => d.key === key)?.views ?? 0,
  }));

  return {
    totals,
    previous: prior,
    changes: {
      visitors: change(totals.visitors, prior.visitors),
      newVisitors: change(totals.newVisitors, prior.newVisitors),
      returningVisitors: change(totals.returningVisitors, prior.returningVisitors),
      pageViews: change(totals.pageViews, prior.pageViews),
    },
    series: [...byBucket.values()].map((b) => ({
      key: b.key,
      label: b.label,
      short: b.short,
      value: b.visitors.size,
      detail: `${b.views} page view${b.views === 1 ? "" : "s"}`,
    })),
    byCountry: groupVisitors(current, (r) => r.country).map((row) => ({
      ...row,
      name: countryName(row.key),
    })),
    byDevice,
    topPages: groupVisitors(current, (r) => r.path).slice(0, 10),
  };
}
