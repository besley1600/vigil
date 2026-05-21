import type { NextConfig } from 'next'

const isVercel = !!process.env.VERCEL

const nextConfig: NextConfig = {
  output: isVercel ? undefined : 'standalone',
  outputFileTracingRoot: isVercel ? undefined : __dirname,
}

export default nextConfig
