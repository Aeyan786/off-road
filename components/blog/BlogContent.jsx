import { looksLikeHtml } from "@/lib/rich-text";
import { sanitizeRichText } from "@/lib/server/sanitize";
import { toParagraphs } from "@/lib/blog-text";

/**
 * Renders an article's body in whichever shape it was saved.
 *
 * Rich text from the admin editor is sanitised again here before it is
 * injected, so even content written straight into the table is safe.
 * Posts written before the editor existed are plain text with blank lines
 * between paragraphs, and still render through their own path.
 *
 * Spacing comes from each element's own margins (not a parent space-y),
 * so paragraphs, headings and lists sit evenly without doubled gaps. Long
 * words and URLs wrap instead of pushing the article wider than the page.
 */
const BODY_CLASS =
  "mt-8 min-w-0 break-words text-base leading-relaxed text-neutral-700 [overflow-wrap:anywhere]";

const RICH_TEXT_CLASS = [
  BODY_CLASS,
  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
  "[&_p]:my-4",
  "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-neutral-900",
  "[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-neutral-900",
  "[&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-neutral-900",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:my-1.5 [&_li>p]:my-0",
  "[&_a]:cursor-pointer [&_a]:font-medium [&_a]:text-brand [&_a]:underline",
  "[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-600",
  "[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:rounded-sm [&_pre]:bg-neutral-900 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-neutral-100",
  "[&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm",
  "[&_strong]:font-semibold [&_strong]:text-neutral-900",
].join(" ");

/**
 * Posts written before the editor used Markdown-style "# Heading" lines.
 * Those are shown as real headings rather than with a literal "#"; the
 * text is rendered by React, so nothing here is injected as HTML.
 */
function PlainTextBlock({ paragraph }) {
  const heading = /^(#{1,6})\s+(.+)$/.exec(paragraph);

  if (heading) {
    const level = heading[1].length;
    const text = heading[2].trim();
    if (level <= 2) {
      return <h2 className="mt-10 text-2xl font-bold leading-snug text-neutral-900 first:mt-0">{text}</h2>;
    }
    return <h3 className="mt-8 text-xl font-bold leading-snug text-neutral-900 first:mt-0">{text}</h3>;
  }

  return <p className="whitespace-pre-line">{paragraph}</p>;
}

export default function BlogContent({ content }) {
  if (looksLikeHtml(content)) {
    return (
      <div
        className={RICH_TEXT_CLASS}
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
      />
    );
  }

  return (
    <div className={`${BODY_CLASS} space-y-5`}>
      {toParagraphs(content).map((paragraph, index) => (
        <PlainTextBlock key={index} paragraph={paragraph} />
      ))}
    </div>
  );
}
