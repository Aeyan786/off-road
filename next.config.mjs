/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
        {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
       {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    // Media/product image uploads and ZIP imports post their files through
    // Server Actions, which cap request bodies at 1MB by default.
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
