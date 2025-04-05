import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  reactStrictMode: false, // turn to false
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
