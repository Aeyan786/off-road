"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BlogImageField from "@/components/admin/blogs/BlogImageField";
import { createBlog, updateBlog } from "@/actions/blogs";
import { countWords } from "@/lib/blog-text";
import { cn } from "@/lib/utils";

const initialState = {
  error: null,
  fieldErrors: {},
  values: null,
};

const INPUT_CLASS =
  "flex w-full rounded-lg border border-neutral-300 bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Field({ label, htmlFor, error, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <span className="text-xs text-neutral-400">{hint}</span> : null}
      </div>

      {children}

      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared by the Add Blog and Edit Blog pages, like ProductForm. */
export default function BlogForm({ blog }) {
  const router = useRouter();
  const isEdit = Boolean(blog?.id);

  const [image, setImage] = useState(blog?.image ?? null);
  const [wordCount, setWordCount] = useState(countWords(blog?.content));

  const [state, formAction, isPending] = useActionState(
    async (_prev, formData) => {
      const result = isEdit
        ? await updateBlog(blog.id, formData)
        : await createBlog(formData);

      if (result?.success) {
        const published = formData.get("status") === "published";
        toast.success(
          isEdit
            ? "Blog saved."
            : published
              ? "Blog published."
              : "Draft saved — it stays hidden from the website."
        );
        if (result.warning) toast.warning(result.warning);
        router.push("/admin/blogs");
        return initialState;
      }

      if (result?.error) toast.error(result.error);

      return {
        error: result?.error ?? null,
        fieldErrors: result?.fieldErrors ?? {},
        values: Object.fromEntries(formData.entries()),
        attempt: (_prev?.attempt ?? 0) + 1,
      };
    },
    initialState
  );

  const fieldErrors = state?.fieldErrors ?? {};
  const values = state?.values;
  const getValue = (name, fallback = "") =>
    values && values[name] !== undefined ? values[name] : fallback;

  const errorProps = (name) =>
    fieldErrors[name]
      ? { "aria-invalid": true, "aria-describedby": `${name}-error` }
      : {};

  const autoGrow = (e) => {
    e.currentTarget.style.height = "auto";
    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="image" value={image ?? ""} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Article</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Field label="Title" htmlFor="title" error={fieldErrors.title}>
                <Input
                  // Base UI inputs can't change defaultValue once mounted, so
                  // remount with the submitted value after each failed save.
                  key={state?.attempt ?? 0}
                  id="title"
                  name="title"
                  defaultValue={getValue("title", blog?.title ?? "")}
                  {...errorProps("title")}
                />
              </Field>

              <Field
                label="Content"
                htmlFor="content"
                error={fieldErrors.content}
                hint={`${wordCount.toLocaleString("en-GB")} word${wordCount === 1 ? "" : "s"}`}
              >
                <textarea
                  id="content"
                  name="content"
                  rows={14}
                  defaultValue={getValue("content", blog?.content ?? "")}
                  onInput={(e) => {
                    autoGrow(e);
                    setWordCount(countWords(e.currentTarget.value));
                  }}
                  className={`${INPUT_CLASS} min-h-72 resize-none overflow-hidden leading-relaxed`}
                  {...errorProps("content")}
                />
                <p className="text-xs text-neutral-400">
                  Plain text. Leave a blank line between paragraphs.
                </p>
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Publishing</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Field label="Status" htmlFor="status" error={fieldErrors.status}>
                <select
                  id="status"
                  name="status"
                  defaultValue={getValue("status", blog?.status ?? "draft")}
                  className={cn(INPUT_CLASS, "h-9 cursor-pointer py-0")}
                  {...errorProps("status")}
                >
                  <option value="draft">Draft — hidden from the website</option>
                  <option value="published">Published — visible on the website</option>
                </select>
              </Field>
              <p className="text-xs text-neutral-400">
                Drafts only need a title. Publishing also requires an image and content.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Image</CardTitle>
            </CardHeader>

            <CardContent>
              <BlogImageField value={image} onChange={setImage} error={fieldErrors.image} />
            </CardContent>
          </Card>
        </div>
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" className="cursor-pointer rounded-sm px-3 text-xs" disabled={isPending}>
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {isEdit ? "Save Changes" : "Create Blog"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="cursor-pointer rounded-sm px-3 text-xs"
          onClick={() => router.push("/admin/blogs")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
