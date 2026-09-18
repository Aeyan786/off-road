import { z } from "zod";

/**
 * Server-side blog validation.
 *
 * A draft only needs a title, so half-written articles can be saved.
 * Publishing additionally requires the image and content, so nothing
 * incomplete ever reaches the storefront.
 */
export const blogSchema = z
  .object({
    title: z
      .string({ error: "Title is required." })
      .trim()
      .min(1, "Title is required.")
      .max(200, "Title must be 200 characters or fewer."),
    image: z
      .url("The image must be a valid URL.")
      .nullable(),
    content: z.string().trim(),
    // Mirrors BLOG_STATUSES in lib/data/blogs.js and the DB CHECK constraint.
    status: z.enum(["draft", "published"], { error: "Choose a valid status." }),
  })
  .superRefine((blog, ctx) => {
    if (blog.status !== "published") return;
    if (!blog.image) {
      ctx.addIssue({ code: "custom", path: ["image"], message: "Add an image before publishing." });
    }
    if (!blog.content) {
      ctx.addIssue({ code: "custom", path: ["content"], message: "Add some content before publishing." });
    }
  });

/**
 * Parses a blog <form> submission.
 * @returns {{data: object}|{fieldErrors: Record<string, string>}}
 */
export function parseBlogForm(formData) {
  const result = blogSchema.safeParse({
    title: formData.get("title") ?? "",
    // Exactly one image: a single URL, or empty for none.
    image: String(formData.get("image") ?? "").trim() || null,
    // Browsers submit textarea line breaks as \r\n; store plain \n.
    content: String(formData.get("content") ?? "").replace(/\r\n?/g, "\n"),
    status: formData.get("status") || "draft",
  });

  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    // One message per field is all the form UI shows.
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [field, messages[0]])
      ),
    };
  }

  return { data: result.data };
}
