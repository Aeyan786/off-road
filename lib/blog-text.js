/**
 * Text helpers for blog content, which may be rich text (HTML) from the
 * admin editor or plain text with blank lines between paragraphs. Tags are
 * stripped first, so counts and excerpts read the same either way. Nothing
 * here is stored — it is always derived from the current content.
 */
import { toPlainText } from "@/lib/rich-text";

export function countWords(content) {
  const text = toPlainText(content);
  return text ? text.split(/\s+/).length : 0;
}

/** Roughly 200 words a minute, never less than one. */
export function readingMinutes(content) {
  return Math.max(1, Math.round(countWords(content) / 200));
}

/**
 * First `maxLength` characters of the readable text, cut on a word boundary.
 * Works on rich text and on older plain-text posts alike, so cards never
 * show raw HTML or Markdown.
 */
export function toExcerpt(content, maxLength = 160) {
  const text = toPlainText(content);
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
