/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    domains: ['cdn.sanity.io'],
    unoptimized: true
  },
  output: 'export'
}

module.exports = nextConfig
