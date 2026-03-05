/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
    unoptimized: true,
  }
}

module.exports = nextConfig
