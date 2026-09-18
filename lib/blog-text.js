/**
 * Plain-text helpers for blog content. Content is stored as plain text;
 * blank lines separate paragraphs. Nothing here is stored — word counts and
 * excerpts are always derived from the current content.
 */

export function countWords(content) {
  const text = (content ?? "").trim();
  return text ? text.split(/\s+/).length : 0;
}

/** Roughly 200 words a minute, never less than one. */
export function readingMinutes(content) {
  return Math.max(1, Math.round(countWords(content) / 200));
}

/** First `maxLength` characters, cut on a word boundary. */
export function toExcerpt(content, maxLength = 160) {
  const text = (content ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, "")}…`;
}

/** Paragraphs split on blank lines; single line breaks are kept inside them. */
export function toParagraphs(content) {
  return (content ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatBlogDate(value) {
  return value ? dateFormatter.format(new Date(value)) : "";
}
