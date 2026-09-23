import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/data/products";
import { getBlogs } from "@/lib/data/blogs";
import { getAllCategoriesFlat } from "@/lib/data/categories";
import { safeQuery } from "@/lib/data/safe";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * /sitemap.xml — static public pages plus active products, categories and
 * published blogs, straight from the database (new content appears
 * automatically). Admin, auth and checkout routes are excluded.
 */
export default async function sitemap() {
  const base = siteUrl();
  const supabase = await createClient();

  const [products, blogs, categories] = await Promise.all([
    safeQuery(getProducts(supabase), []),
    safeQuery(getBlogs(supabase), []), // published only
    safeQuery(getAllCategoriesFlat(supabase), []),
  ]);

  const staticPages = [
    ["", 1, "daily"],
    ["/products", 0.9, "daily"],
    ["/new-arrivals", 0.8, "daily"],
    ["/blogs", 0.7, "daily"],
    ["/service", 0.7, "monthly"],
    ["/about", 0.5, "monthly"],
    ["/contact", 0.5, "monthly"],
    ["/shipping", 0.3, "yearly"],
    ["/refunds", 0.3, "yearly"],
    ["/privacy", 0.3, "yearly"],
    ["/terms", 0.3, "yearly"],
    ["/cookies", 0.3, "yearly"],
  ].map(([path, priority, changeFrequency]) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  return [
    ...staticPages,
    ...categories.map((category) => ({
      url: `${base}/products?category=${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.id}`,
      lastModified: new Date(product.updated_at ?? product.created_at),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...blogs.map((blog) => ({
      url: `${base}/blogs/${blog.slug}`,
      lastModified: new Date(blog.updated_at ?? blog.published_at ?? blog.created_at),
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  ];
}
