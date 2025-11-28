/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  // CRITICAL: Exclude AWS SDK and other large packages from function bundling
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      // Exclude AWS SDK (pulled in by @types/nodemailer but not used)
      'node_modules/@aws-sdk/**',
      'node_modules/@smithy/**',
      'node_modules/@aws-crypto/**',
    ],
  },
  // CRITICAL: Include only what's needed for each route
  outputFileTracingIncludes: {
    '/api/orders': [
      './node_modules/nodemailer/**',
      './node_modules/bcryptjs/**',
    ],
  },
};

export default nextConfig;