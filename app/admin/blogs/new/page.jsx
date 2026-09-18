import Breadcrumbs from "@/components/admin/Breadcrumbs";
import BlogForm from "@/components/admin/blogs/BlogForm";

export const metadata = {
  title: "Add Blog | Off Road Performance",
};

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs
          items={[{ label: "Blogs", href: "/admin/blogs" }, { label: "New" }]}
        />
        <h1 className="text-2xl font-bold text-neutral-900">Add Blog</h1>
        <p className="text-sm text-neutral-500">
          Write a new article for the storefront.
        </p>
      </div>

      <BlogForm />
    </div>
  );
}
