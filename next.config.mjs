import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
const __dirname = path.resolve()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // turn to false
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
