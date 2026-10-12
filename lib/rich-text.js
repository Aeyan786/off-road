/**
 * Helpers for blog content, which can be in one of two shapes:
 *
 *   - rich text (HTML) saved by the admin editor, or
 *   - plain text with blank lines between paragraphs, which is how posts
 *     written before the editor existed are stored.
 *
 * Nothing converts between the two: `looksLikeHtml` decides how a post is
 * rendered, so older posts keep working untouched.
 */

const BLOCK_TAG = /<(p|div|h[1-6]|ul|ol|li|blockquote|pre|br|img|figure|table)\b/i;

/**
 * Readable plain text from either shape of content — used for excerpts,
 * word counts and anywhere a post is summarised rather than shown in full.
 * HTML has its tags and entities removed; older plain-text posts have their
 * Markdown markers (# headings, **bold**, list bullets, [links](url))
 * removed so a card never shows raw syntax.
 */
export function toPlainText(content) {
  if (looksLikeHtml(content)) return stripHtml(content);

  return String(content ?? "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, "$1$2")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the content came from the rich text editor. */
export function looksLikeHtml(content) {
  return BLOCK_TAG.test(String(content ?? ""));
}

/** Tag-free text, for word counts, excerpts and search. */
export function stripHtml(content) {
  return String(content ?? "")
    // Treat block ends as spaces so words don't run together.
    .replace(/<\/(p|div|h[1-6]|li|blockquote|pre|tr)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when rich text holds nothing a reader would see. Quill stores an
 * empty document as "<p><br></p>", which is not an empty string, so the
 * publish validation needs this rather than a length check.
 */
export function isEmptyRichText(content) {
  const text = String(content ?? "");
  if (!text.trim()) return true;
  if (/<img\b/i.test(text)) return false;
  return stripHtml(text).length === 0;
}
