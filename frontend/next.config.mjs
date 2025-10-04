/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ New key for Next.js 15
  serverExternalPackages: ["mongoose", "nodemailer"],

  // ✅ Needed for Vercel/Docker deploys
  output: "standalone",
};

export default nextConfig;
