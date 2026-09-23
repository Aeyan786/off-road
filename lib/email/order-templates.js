import { addressLines } from "@/lib/format-address";
import { formatOrderNumber } from "@/lib/order-status";
import { DEFAULT_TEMPLATES, DEFAULT_THEME, fillPlaceholders } from "@/lib/email/template-config";

/**
 * Transactional order emails as plain HTML with inline styles (what email
 * clients reliably render) plus a text version.
 *
 * The layout — items table, totals, addresses, tracking box, footer — is
 * fixed here. The subject, heading, body text, header-bar text and colours
 * come from the admin-editable templates (/admin/templates). Every value
 * that came from a customer, product or admin is HTML-escaped.
 *
 * Pure (no server imports), so the admin editor renders its live preview
 * with exactly the same code that sends the email.
 */

const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const fmt = (value) => money.format(Number(value ?? 0));
const dateFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "Europe/London" });
const formatDate = (value) => (value ? dateFmt.format(new Date(value)) : "");

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Values for the {{placeholders}} an admin can use. */
function placeholderValues(order) {
  return {
    customer_name: order.full_name.split(" ")[0],
    full_name: order.full_name,
    order_number: formatOrderNumber(order.order_number),
    order_total: fmt(order.total),
    order_date: formatDate(order.created_at),
    tracking_number: order.tracking_number ?? "",
    customer_email: order.email ?? "",
    customer_phone: order.phone ?? "",
    item_count: String(order.order_items.reduce((n, i) => n + i.quantity, 0)),
    delivered_date: formatDate(order.delivered_at),
  };
}

function itemsTable(order) {
  const rows = order.order_items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#111">
          ${esc(item.product_name)}
          <div style="font-size:12px;color:#777">${esc([item.manufacturer, item.model, item.year].filter(Boolean).join(" · "))}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#555;text-align:center;white-space:nowrap">× ${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#111;text-align:right;white-space:nowrap">${fmt(item.line_total)}</td>
      </tr>`
    )
    .join("");

  const shipping = Number(order.shipping_cost) > 0 ? fmt(order.shipping_cost) : "Free";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px">
      ${rows}
      <tr><td style="padding:10px 0 2px;font-size:14px;color:#555">Subtotal</td><td></td><td style="padding:10px 0 2px;font-size:14px;color:#555;text-align:right">${fmt(order.subtotal)}</td></tr>
      <tr><td style="padding:2px 0;font-size:14px;color:#555">Shipping</td><td></td><td style="padding:2px 0;font-size:14px;color:#555;text-align:right">${shipping}</td></tr>
      <tr><td style="padding:8px 0;font-size:16px;font-weight:bold;color:#111">Total</td><td></td><td style="padding:8px 0;font-size:16px;font-weight:bold;color:#111;text-align:right">${fmt(order.total)}</td></tr>
    </table>`;
}

function addressBlock(title, address) {
  return `
    <td valign="top" style="padding:0 16px 0 0;font-size:13px;line-height:1.5;color:#333">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:4px">${esc(title)}</div>
      ${addressLines(address).map(esc).join("<br>")}
    </td>`;
}

function trackingBox(order, theme) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${theme.accent_color};border-left-width:4px;border-radius:6px;margin:0 0 20px">
      <tr><td style="padding:14px 16px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#555">Tracking number</div>
        <div style="font-size:18px;font-weight:bold;color:${theme.accent_color};margin-top:4px;word-break:break-all">${esc(order.tracking_number)}</div>
      </td></tr>
    </table>`;
}

/** Admin body text -> paragraphs (blank line = new paragraph, line break kept). */
function bodyHtml(text, values, theme) {
  return String(text)
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:${theme.body_text_color}">${fillPlaceholders(esc(p), values, esc).replace(/\n/g, "<br>")}</p>`
    )
    .join("");
}

function layout({ theme, preheader, heading, body, details }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif">
  <span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:6px;overflow:hidden">
        <tr><td style="background:${theme.header_background};padding:18px 24px;color:${theme.header_text_color};font-size:18px;font-weight:bold">${esc(theme.header_title)}</td></tr>
        <tr><td style="padding:28px 24px">
          <h1 style="margin:0 0 14px;font-size:22px;color:${theme.heading_color}">${esc(heading)}</h1>
          ${body}
          ${details}
        </td></tr>
        <tr><td style="padding:16px 24px;background:#fafafa;font-size:12px;line-height:1.5;color:#888">
          Questions about your order? Just reply to this email or contact us via our website.<br>${esc(theme.header_title)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function itemsText(order) {
  const lines = order.order_items.map((i) => `- ${i.product_name} × ${i.quantity}  ${fmt(i.line_total)}`);
  const shipping = Number(order.shipping_cost) > 0 ? fmt(order.shipping_cost) : "Free";
  return [...lines, "", `Subtotal: ${fmt(order.subtotal)}`, `Shipping: ${shipping}`, `Total: ${fmt(order.total)}`].join("\n");
}

/** The fixed, data-driven part under the admin's text, per email. */
function detailsFor(key, order, theme) {
  const shippingTo = addressBlock(key === "order_delivered" ? "Delivered to" : "Shipping to", order.shipping_address);
  if (key === "order_placed") {
    return `
      <p style="margin:6px 0 4px;font-size:13px;color:#777">Placed ${esc(formatDate(order.created_at))}</p>
      ${itemsTable(order)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr>
        ${shippingTo}${addressBlock("Billing address", order.billing_address)}
      </tr></table>
      <p style="margin:20px 0 0;font-size:13px;color:#777">Contact: ${esc(order.email)} · ${esc(order.phone)}</p>`;
  }
  if (key === "order_recieved") {
    return `
      <p style="margin:6px 0 4px;font-size:13px;color:#777">Placed ${esc(formatDate(order.created_at))} · ${esc(order.email)} · ${esc(order.phone)}</p>
      ${itemsTable(order)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr>
        ${shippingTo}${addressBlock("Billing address", order.billing_address)}
      </tr></table>`;
  }
  if (key === "order_cancelled" || key === "order_refunded") {
    return itemsTable(order);
  }
  if (key === "order_shipped") {
    return `
      ${trackingBox(order, theme)}
      ${itemsTable(order)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr>${shippingTo}</tr></table>`;
  }
  return `
    ${itemsTable(order)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr>${shippingTo}</tr></table>
    ${order.tracking_number ? `<p style="margin:16px 0 0;font-size:13px;color:#777">Tracking number: ${esc(order.tracking_number)}</p>` : ""}`;
}

/**
 * Renders one order email.
 *
 * @param {"order_placed"|"order_shipped"|"order_delivered"} key
 * @param {object} order order row with order_items
 * @param {{template?: {subject, heading, body}, theme?: object}} [settings]
 *   admin-edited text/colours; defaults are used for anything missing
 * @returns {{subject: string, html: string, text: string}}
 */
export function renderOrderEmail(key, order, settings = {}) {
  const template = { ...DEFAULT_TEMPLATES[key], ...(settings.template ?? {}) };
  const theme = { ...DEFAULT_THEME, ...(settings.theme ?? {}) };
  const values = placeholderValues(order);

  const subject = fillPlaceholders(template.subject, values).replace(/\s+/g, " ").trim();
  const heading = fillPlaceholders(template.heading, values);
  const bodyText = fillPlaceholders(template.body, values);

  const textParts = [heading, "", bodyText];
  if (key === "order_recieved") textParts.push("", `Contact: ${order.email} · ${order.phone}`);
  if (key === "order_shipped") textParts.push("", `Tracking number: ${order.tracking_number}`);
  textParts.push("", itemsText(order));
  if (key !== "order_delivered") textParts.push("", `Shipping to: ${addressLines(order.shipping_address).join(", ")}`);

  return {
    subject,
    html: layout({
      theme,
      preheader: bodyText.split("\n")[0],
      heading,
      body: bodyHtml(template.body, values, theme),
      details: detailsFor(key, order, theme),
    }),
    text: textParts.join("\n"),
  };
}
