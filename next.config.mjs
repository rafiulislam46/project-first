/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  images: {
    // Allow Cloudinary + placeholder + Supabase storage
    domains: ["res.cloudinary.com", "placehold.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  eslint: {
    // Ignore ESLint errors during production builds (e.g., on Vercel)
    ignoreDuringBuilds: true
  }
};

export default nextConfig;