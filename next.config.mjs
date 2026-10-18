/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    instrumentationHook: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
