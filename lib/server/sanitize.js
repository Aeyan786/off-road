import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitises rich text from the blog editor.
 *
 * Applied twice on purpose: when an admin saves (so the database never
 * holds anything dangerous) and again when a post is rendered (so content
 * that predates this function, or was written straight into the table, is
 * still safe to put through dangerouslySetInnerHTML).
 *
 * The allow-list matches what the editor's toolbar can produce.
 */
const CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "blockquote",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "code",
    "pre",
    "span",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
  // Quill marks indent levels with ql-* classes; links are the only URLs.
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|#)/i,
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
  FORBID_ATTR: ["style", "srcset", "onerror", "onload", "onclick"],
};

export function sanitizeRichText(html) {
  if (!html) return "";

  const clean = DOMPurify.sanitize(normalizeEditorHtml(String(html)), CONFIG);

  // Anything that leaves the site opens in a new tab without leaking the
  // referrer; DOMPurify keeps the attributes, it doesn't add them.
  return clean.replace(/<a\s+([^>]*href="https?:\/\/[^"]*"[^>]*)>/gi, (match, attrs) =>
    /rel=/i.test(attrs) ? match : `<a ${attrs} target="_blank" rel="noreferrer">`
  );
}

/**
 * Undoes two habits of Quill 2's getSemanticHTML() that break the page:
 *
 *   - it writes every space as &nbsp;, which turns each paragraph into one
 *     unbreakable line that runs off the side of the article;
 *   - it leaves empty <p></p> / <p><br></p> paragraphs, which stack up as
 *     large blank gaps between sections.
 *
 * Also drops Quill's internal list-marker spans. Runs on save and on
 * render, so posts already saved with these quirks are fixed without
 * touching the database.
 */
function normalizeEditorHtml(html) {
  return html
    .replace(/&nbsp;|&#160;| /gi, " ")
    .replace(/<span class="ql-ui"[^>]*>\s*<\/span>/gi, "")
    .replace(/<p>(\s|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/[ \t]{2,}/g, " ");
}
