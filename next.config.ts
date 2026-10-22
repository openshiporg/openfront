import type { NextConfig } from 'next';
import { s3ForcePathStyle } from './features/keystone/lib/s3-storage';

const s3Hostname = process.env.S3_ENDPOINT ? process.env.S3_ENDPOINT.replace(/^https?:\/\//, '').replace(/:\d+$/, '') : '/';

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['graphql'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Workaround since we diverged from Keystone reltionship and document views
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Virtual-hosted buckets serve images from <bucket>.<endpoint host>
        hostname: s3ForcePathStyle(process.env.S3_ENDPOINT) ? s3Hostname : `${process.env.S3_BUCKET_NAME}.${s3Hostname}`,
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;