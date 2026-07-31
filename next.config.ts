import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Optimize commonly used icon/utility packages
  serverExternalPackages: ['bcryptjs'],

  images: {
    // Add remote domains here if needed in the future
    remotePatterns: [],
  },

  // Enable experimental optimizations for large packages
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
}

export default nextConfig
