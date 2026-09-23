/**
 * Editable email templates — shared by the /admin/templates editor, its live
 * preview and the sending code, so all three agree. The defaults match the
 * rows seeded by 0011_email_templates.sql and are used as a fallback if the
 * database can't be read.
 */

export const TEMPLATE_KEYS = [
  "order_placed",
  "order_shipped",
  "order_delivered",
  "order_recieved",
  "order_cancelled",
  "order_refunded",
];

export const TEMPLATE_META = {
  order_placed: {
    label: "Order Placed",
    description: "Sent when Stripe confirms payment and the order is created.",
  },
  order_shipped: {
    label: "Order Shipped",
    description:
      "Sent when an admin marks the order as shipped (with tracking number).",
  },
  order_delivered: {
    label: "Order Delivered",
    description: "Sent when an admin marks the order as delivered.",
  },
  order_recieved: {
    label: "Order Received",
    description: "Sent when an order received.",
  },
  order_cancelled: {
    label: "Order Cancelled",
    description: "Sent when an admin marks the order as cancelled.",
  },
  order_refunded: {
    label: "Order Refunded",
    description: "Sent when an admin marks the order as refunded.",
  },
};

/** Placeholders and which templates may use them. */
export const PLACEHOLDERS = {
  customer_name: { label: "Customer first name", templates: TEMPLATE_KEYS },
  full_name: { label: "Customer full name", templates: TEMPLATE_KEYS },
  order_number: {
    label: "Order number, e.g. #100005",
    templates: TEMPLATE_KEYS,
  },
  order_total: { label: "Order total, e.g. £343.18", templates: TEMPLATE_KEYS },
  order_date: { label: "Date the order was placed", templates: TEMPLATE_KEYS },
  tracking_number: {
    label: "Tracking number",
    templates: ["order_shipped", "order_delivered"],
  },
  delivered_date: { label: "Delivery date", templates: ["order_delivered"] },
  customer_email: { label: "Customer email", templates: TEMPLATE_KEYS },
  customer_phone: { label: "Customer phone", templates: TEMPLATE_KEYS },
  item_count: { label: "Number of items", templates: TEMPLATE_KEYS },
};

export const DEFAULT_TEMPLATES = {
  order_placed: {
    subject: "Order {{order_number}} confirmed — Off Road Performance",
    heading: "Order {{order_number}} confirmed",
    body: "Hi {{customer_name}}, thanks for your order! We've received your payment and are getting your parts ready.\n\nWe'll email you again with a tracking number as soon as it ships.",
  },

  order_shipped: {
    subject: "Order {{order_number}} has shipped — Off Road Performance",
    heading: "Your order {{order_number}} is on its way",
    body: "Hi {{customer_name}}, good news — your order has been dispatched.\n\nYou can follow its progress with tracking number {{tracking_number}}.",
  },

  order_delivered: {
    subject: "Order {{order_number}} delivered — Off Road Performance",
    heading: "Order {{order_number}} delivered",
    body: "Hi {{customer_name}}, your order was delivered on {{delivered_date}}. We hope you enjoy your new parts!",
  },

  order_received: {
    subject: "Order {{order_number}} received — Off Road Performance",
    heading: "Order {{order_number}} confirmed",
    body: "Hi {{customer_name}}, thanks for your order! We've received your payment and are getting your parts ready.\n\nWe'll email you again with a tracking number as soon as it ships.",
  },

  order_cancelled: {
    subject: "Order {{order_number}} has been cancelled — Off Road Performance",
    heading: "Order {{order_number}} cancelled",
    body: "Hi {{customer_name}}, your order has been cancelled.\n\nIf you have any questions, please contact us.",
  },

  order_refunded: {
    subject: "Order {{order_number}} refunded — Off Road Performance",
    heading: "Order {{order_number}} has been refunded",
    body: "Hi {{customer_name}}, your order {{order_number}} has been refunded.\n\nRefunded amount: {{order_total}}",
  },
};

// Fallbacks only — the live wording comes from the email_templates table.
DEFAULT_TEMPLATES.order_recieved = {
  subject: "New order {{order_number}} — {{order_total}}",
  heading: "New order {{order_number}}",
  body: "{{full_name}} has placed an order for {{order_total}} ({{item_count}} items).\n\nContact: {{customer_email}} · {{customer_phone}}",
};
DEFAULT_TEMPLATES.order_cancelled = {
  subject: "Order {{order_number}} has been cancelled",
  heading: "Order {{order_number}} cancelled",
  body: "Hi {{customer_name}}, your order has been cancelled.\n\nIf you paid for this order, any refund will be issued to your original payment method.",
};
DEFAULT_TEMPLATES.order_refunded = {
  subject: "Order {{order_number}} refunded",
  heading: "Order {{order_number}} refunded",
  body: "Hi {{customer_name}}, we have refunded {{order_total}} for your order.\n\nRefunds usually reach your account within 5–10 working days.",
};

export const THEME_FIELDS = {
  header_background: "Header background",
  header_text_color: "Header text",
  heading_color: "Heading",
  body_text_color: "Body text",
  accent_color: "Accent (tracking box, highlights)",
};

export const DEFAULT_THEME = {
  header_title: "Off Road Performance",
  header_background: "#1B9DDB",
  header_text_color: "#FFFFFF",
  heading_color: "#111111",
  body_text_color: "#444444",
  accent_color: "#1B9DDB",
};

export const LIMITS = {
  subject: 200,
  heading: 200,
  body: 5000,
  header_title: 80,
};
export const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const PLACEHOLDER_PATTERN = /\{\{\s*([a-z_]+)\s*\}\}/g;

/** Placeholder names used in `text` that `key` doesn't support. */
export function unknownPlaceholders(text, key) {
  const bad = new Set();
  for (const [, name] of String(text ?? "").matchAll(PLACEHOLDER_PATTERN)) {
    if (!PLACEHOLDERS[name]?.templates.includes(key)) bad.add(name);
  }
  return [...bad];
}

/**
 * Replaces {{placeholders}} with values. `escape` is applied to each value
 * (HTML-escaping for the HTML version); unknown names are left as-is.
 */
export function fillPlaceholders(text, values, escape = (v) => v) {
  return String(text ?? "").replace(PLACEHOLDER_PATTERN, (match, name) =>
    Object.hasOwn(values, name) ? escape(values[name]) : match,
  );
}

/** A realistic order for the editor's live preview. */
export const SAMPLE_ORDER = {
  id: "preview",
  order_number: 100123,
  full_name: "Alex Morgan",
  email: "alex@example.com",
  phone: "+44 7700 900123",
  shipping_address: {
    line1: "59 Hawthorn Road",
    city: "Little Sutton",
    county: "Cheshire",
    postcode: "CH66 1PS",
    country: "GB",
  },
  billing_address: {
    line1: "59 Hawthorn Road",
    city: "Little Sutton",
    county: "Cheshire",
    postcode: "CH66 1PS",
    country: "GB",
  },
  subtotal: 655.16,
  shipping_cost: 0,
  total: 655.16,
  tracking_number: "1Z999AA10123456784",
  created_at: "2026-09-20T10:15:00Z",
  delivered_at: "2026-09-23T14:02:00Z",
  order_items: [
    {
      product_name: "Fatty Header Pipe",
      manufacturer: "Kawasaki",
      model: "KFX 80",
      year: "2003-06",
      quantity: 1,
      unit_price: 311.98,
      line_total: 311.98,
    },
    {
      product_name: "Powercore 4 Silencer",
      manufacturer: "Honda",
      model: "TRX 90X",
      year: "2013-21",
      quantity: 1,
      unit_price: 343.18,
      line_total: 343.18,
    },
  ],
};
