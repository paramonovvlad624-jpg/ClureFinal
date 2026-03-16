/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  trailingSlash: true,
  images: {
    domains: ['cdn.sanity.io'],
    unoptimized: true
  },
  output: 'export',
  async headers() {
    return [
      {
        // Cache static image assets long-term
        source: '/:path*\.(jpg|jpeg|png|webp|svg|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        // Keep HTML fresh
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ]
      }
    ]
  }
}

module.exports = nextConfig
