import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
const __dirname = path.resolve()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  reactStrictMode: false, // turn to false
  // output: 'standalone', // Enable standalone output for Docker deployment,
  // outputFileTracingRoot: path.join(__dirname),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
