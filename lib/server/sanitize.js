import sanitizeHtml from "sanitize-html";

/**
 * Sanitises rich text from the blog editor.
 *
 * Applied twice on purpose: when an admin saves (so the database never
 * holds anything dangerous) and again when a post is rendered (so content
 * that predates this function, or was written straight into the table, is
 * still safe to put through dangerouslySetInnerHTML).
 *
 * Uses sanitize-html rather than DOMPurify: it parses with htmlparser2 and
 * needs no browser DOM. isomorphic-dompurify pulls in jsdom, whose
 * dependency chain require()s an ES module and crashes on serverless Node
 * runtimes that don't support require(esm) — which took the blog pages
 * down in production.
 *
 * The allow-list matches what the editor's toolbar can produce.
 */
const OPTIONS = {
  allowedTags: [
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
  allowedAttributes: {
    a: ["href", "target", "rel"],
    // Quill marks indent levels and code blocks with ql-* classes. Nothing
    // else may carry a class, so pasted content can't pull in site styles.
    "*": ["class"],
  },
  allowedClasses: {
    "*": [/^ql-indent-\d+$/, /^ql-syntax$/],
  },
  // Links are the only URLs; relative links and in-page anchors stay valid.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
  // Script/style contents are dropped entirely, not left behind as text.
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed"],
  transformTags: {
    // Anything that leaves the site opens in a new tab without leaking the
    // referrer.
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? "");
      return {
        tagName,
        attribs: external ? { ...attribs, target: "_blank", rel: "noreferrer" } : attribs,
      };
    },
  },
};

export function sanitizeRichText(html) {
  if (!html) return "";
  return sanitizeHtml(normalizeEditorHtml(String(html)), OPTIONS);
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
