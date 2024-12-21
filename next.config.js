function configureWebpack(config, { isServer }) {
  config.externals = [
    ...(config.externals || []),
    ".prisma/client",
    "@aws-sdk/signature-v4-multi-region",
  ];

  config.resolve.alias = {
    ...config.resolve.alias,
    // "@keystone/screens": `keystone/themes/${theme}/screens`,
  };

  return config;
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  webpack: configureWebpack,
  experimental: {
    serverComponentsExternalPackages: ["graphql"],
    optimizeCss: true,
  },
  async redirects() {
    return [
      {
        source: "/admin/api/graphql",
        destination: "/api/graphql",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.S3_ENDPOINT ? process.env.S3_ENDPOINT.replace(/^https?:\/\//, '').replace(/:\d+$/, '') : '/',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);




