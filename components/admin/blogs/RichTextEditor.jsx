"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import "react-quill-new/dist/quill.snow.css";

/**
 * Quill rich text editor for blog content.
 *
 * Loaded with ssr: false because Quill touches `document` as it
 * initialises, which would fail during server rendering.
 *
 * react-quill-new is the React 19 compatible fork: the original react-quill
 * still calls ReactDOM.findDOMNode, which React 19 removed.
 */
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <Skeleton className="min-h-72 w-full rounded-sm" />,
});

/** What the toolbar offers — mirrored by the server's sanitiser allow-list. */
const TOOLBAR = [
  [{ header: [2, 3, 4, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link"],
  ["clean"],
];

const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "code-block",
  "link",
];

/**
 * The form posts through a plain <form action>, so the HTML travels in a
 * hidden input under the same `content` name the server action already
 * reads — nothing about the submission path changes.
 *
 * @param {string} name form field name
 * @param {string} defaultValue existing content (HTML, or plain text for
 *   posts written before the editor existed)
 * @param {(html: string) => void} [onChange] e.g. to update a word count
 */
export default function RichTextEditor({
  name = "content",
  defaultValue = "",
  onChange,
  invalid,
}) {
  const [value, setValue] = useState(defaultValue ?? "");

  const modules = useMemo(
    () => ({ toolbar: TOOLBAR, clipboard: { matchVisual: false } }),
    []
  );

  function handleChange(html) {
    setValue(html);
    onChange?.(html);
  }

  return (
    <div
      className={
        invalid
          ? "rounded-sm ring-1 ring-destructive [&_.ql-toolbar]:rounded-t-sm [&_.ql-container]:rounded-b-sm"
          : "[&_.ql-toolbar]:rounded-t-sm [&_.ql-container]:rounded-b-sm"
      }
    >
      <input type="hidden" name={name} value={value} />

      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={FORMATS}
        className="[&_.ql-editor]:min-h-72 [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed"
      />
    </div>
  );
}
