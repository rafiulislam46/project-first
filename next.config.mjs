/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  images: {
    // Allow Cloudinary + placeholder + Supabase storage + external generators
    domains: ["res.cloudinary.com", "placehold.co", "via.placeholder.com", "replicate.delivery"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    // Ignore ESLint errors during production builds (e.g., on Vercel)
    ignoreDuringBuilds: true
  }
};

export default nextConfig;