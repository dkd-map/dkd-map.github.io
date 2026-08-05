const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''
const isStatic = BASE !== ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isStatic ? BASE : '',
  assetPrefix: isStatic ? BASE : '',
  images: { unoptimized: true },
}
module.exports = nextConfig
